import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';

import { Intercom } from 'ng-intercom';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';

import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { User } from '@maptio-shared/model/user.data';
import { Team } from '@maptio-shared/model/team.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { UserFactory } from '@maptio-core/http/user/user.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';


@Component({
  selector: 'maptio-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss']
})
export class MemberFormComponent implements OnInit {
  public newMember: User;
  public errorMessage: string;

  public createdUser: User;
  public memberForm: FormGroup;

  public isEditingExistingUser = false;
  public isCreatingUser: boolean;
  isSubmissionAttempted = false;

  @Input() member: User;
  @Input() team: Team;
  @Output() addMember = new EventEmitter<User>();

  constructor(
    private cd: ChangeDetectorRef,
    private datasetFactory: DatasetFactory,
    private userFactory: UserFactory,
    private teamFactory: TeamFactory,
    private userService: UserService,
    private analytics: Angulartics2Mixpanel,
    private intercom: Intercom,
  ) {
    this.memberForm = new FormGroup({
      firstname: new FormControl('', {
        validators: [ Validators.required, Validators.minLength(2) ],
        updateOn: 'submit',
      }),

      lastname: new FormControl('', {
        validators: [ Validators.required, Validators.minLength(2) ],
        updateOn: 'submit',
      }),

      email: new FormControl('', {
        validators: [ Validators.email ],
        updateOn: 'submit',
      }),
    });
  }

  ngOnInit(): void {
    if (this.member) {
      this.isEditingExistingUser = true;
      this.memberForm.controls['firstname'].setValue(this.member.firstname);
      this.memberForm.controls['lastname'].setValue(this.member.lastname);
      this.memberForm.controls['email'].setValue(this.member.email);
    }
  }

  save() {
    if (this.isEditingExistingUser) {
      // this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser() {
    if (this.memberForm.dirty && this.memberForm.valid) {
      this.isCreatingUser = true;
      const firstname = this.memberForm.controls['firstname'].value;
      const lastname = this.memberForm.controls['lastname'].value;
      const email = this.memberForm.controls['email'].value;

      this.createUserFullDetails(email, firstname, lastname)
        .then(() => {
          this.addMember.emit(this.createdUser);
        })
        .then(() => {
          this.isCreatingUser = false;
          this.memberForm.reset();
          this.cd.markForCheck();
        });

      this.isCreatingUser = false;
    }
  }

  createUserFullDetails(email: string, firstname: string, lastname: string) {
    const user =  this.userService.createUserNew(email, firstname, lastname);

    return this.datasetFactory.get(this.team)
      .then((datasets: DataSet[]) => {
        const virtualUser = new User();
        virtualUser.name = user.name;
        virtualUser.email = user.email;
        virtualUser.firstname = user.firstname;
        virtualUser.lastname = user.lastname;
        virtualUser.nickname = user.nickname;
        virtualUser.user_id = user.user_id;
        virtualUser.isInAuth0 = user.isInAuth0;
        virtualUser.picture = user.picture;
        virtualUser.teams = [this.team.team_id];
        virtualUser.datasets = datasets.map((d) => d.datasetId);
        this.createdUser = virtualUser;

        return virtualUser;
      },
      (reason) => {
        return Promise.reject(`Can't create ${email} : ${reason}`);
      })
      .then((virtualUser: User) => {
        this.userFactory.create(virtualUser);
        return virtualUser;
      })
      .then((user: User) => {
        this.team.members.push(user);
        this.teamFactory.upsert(this.team).then(() => {
          this.newMember = undefined;
        });
      })
      .then(() => {
        this.analytics.eventTrack('Team', {
          action: 'create',
          team: this.team.name,
          teamId: this.team.team_id,
        });
        return true;
      })
      .then(() => {
        this.intercom.trackEvent('Create user', {
          team: this.team.name,
          teamId: this.team.team_id,
          email: email,
        });
        return true;
      })
      .catch((reason) => {
        console.error(reason);
        this.errorMessage = reason;
        throw Error(reason);
      });
  }
}
