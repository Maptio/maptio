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
import { User, MemberFormFields } from '@maptio-shared/model/user.data';
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

  private firstname: string;
  private lastname: string;
  private email: string;

  public isUserSignUp = false;
  public isEditingExistingUser = false;

  public isSubmissionAttempted = false;
  public isSaving: boolean;
  public savingFailedMessage = null;
  public isSavingSuccess = false;

  @Input() member: User | MemberFormFields;
  @Input() team: Team;
  @Output() addMember = new EventEmitter<User>();
  @Output() cancel = new EventEmitter();

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
        validators: [ Validators.minLength(2) ],
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
      this.memberForm.controls['firstname'].setValue(this.member.firstname);
      this.memberForm.controls['lastname'].setValue(this.member.lastname);
      this.memberForm.controls['email'].setValue(this.member.email);
    }

    if (this.member instanceof User) {
      this.isEditingExistingUser = true;
    }

    // Not adding a member to a team, but creating a user via sign up
    if (!this.team) {
      this.isUserSignUp = true;
    }
  }

  async save() {
    if (!this.memberForm.valid) {
      return;
    }

    this.firstname = this.memberForm.controls['firstname'].value;
    this.lastname = this.memberForm.controls['lastname'].value;
    this.email = this.memberForm.controls['email'].value;

    this.isSaving = true;

    if (this.isEditingExistingUser) {
      await this.updateUser();
    } else if (this.isUserSignUp) {
      await this.createUserFromSignup();
    } else {
      await this.createUserAndAddToTeam();
    }

    this.isSaving = false;
    this.cd.markForCheck();
  }

  async createUserAndAddToTeam() {
    await this.createUserFullDetails();

    this.addMember.emit(this.createdUser);
    this.memberForm.reset();
  }

  private createUserFullDetails() {
    this.createdUser =  this.userService.createUserFromMemberForm(this.email, this.firstname, this.lastname);

    return this.datasetFactory.get(this.team)
      .then((datasets: DataSet[]) => {
        this.createdUser.teams = [this.team.team_id];
        this.createdUser.datasets = datasets.map((d) => d.datasetId);

        return this.createdUser;
      },
      (reason) => {
        return Promise.reject(`Can't create ${this.email} : ${reason}`);
      })
      .then((user: User) => {
        this.userFactory.create(user);
        return user;
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
          email: this.email,
        });
        return true;
      })
      .catch((reason) => {
        console.error(reason);
        this.errorMessage = reason;
        throw Error(reason);
      });
  }

  async updateUser() {
    this.savingFailedMessage = null;
    this.isSavingSuccess = false;
    this.cd.markForCheck();

    if (!(this.member instanceof User)) {
      return;
    }

    try {
      this.isSavingSuccess = await this.userService.updateUser(
        this.member,
        this.firstname,
        this.lastname,
        this.email
      );
    } catch (error) {
      this.isSavingSuccess = false;
      this.savingFailedMessage = `Updating profile information failed with
        error: "${error.message}", please try again later or contact us.`;
      console.error(this.savingFailedMessage, error);
    }

    if (!this.isSavingSuccess) {
      this.isSavingSuccess = false;

      if (!this.savingFailedMessage) {
        this.savingFailedMessage = 'Cannot update profile information, please try again later or contact us.';
      }

      return;
    }

    this.member.firstname = this.firstname;
    this.member.lastname = this.lastname;
    this.member.name = `${this.firstname} ${this.lastname}`;
    this.member.email = this.email;

    this.isSavingSuccess = true;
  }

  async createUserFromSignup() {
    this.createdUser =  this.userService.createUserFromMemberForm(this.email, this.firstname, this.lastname);
    // TODO: This needs to be properly removed... the entire signup page needs to be reworked to just redirect to Auth0
    // this.createdUser = await this.userService.createUserInAuth0(this.createdUser);

    await this.userService.sendConfirmation(
      this.createdUser.email,
      this.createdUser.user_id,
      this.createdUser.firstname,
      this.createdUser.lastname,
      this.createdUser.name
    );
  }

  onCancel() {
    this.cancel.emit();
  }
}
