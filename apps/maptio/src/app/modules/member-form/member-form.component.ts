import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';

import { Subject, Subscription } from 'rxjs';
import {
  mergeMap,
  filter,
  tap,
  debounceTime,
} from 'rxjs/operators';

import {
  isEmpty,
} from 'lodash-es';

import { Intercom } from 'ng-intercom';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';

import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { User } from '@maptio-shared/model/user.data';
import { Permissions } from '@maptio-shared/model/permission.data';
import { Team } from '@maptio-shared/model/team.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { UserFactory } from '@maptio-core/http/user/user.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';


@Component({
  selector: 'maptio-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss']
})
export class MemberFormComponent implements OnInit, OnDestroy {

  user: User;
  Permissions = Permissions;

  public members$: Promise<User[]>;
  public newMember: User;
  private inputEmailSubscription: Subscription;
  public isAlreadyInTeam = false;
  public errorMessage: string;

  public createdUser: User;
  public inviteForm: FormGroup;

  inputEmail$: Subject<string> = new Subject();
  inputEmail: string;
  foundUser: User;

  public isCreatingUser: boolean;
  isSubmissionAttempted = false;
  isShowSelectToAdd: boolean;
  isShowInviteForm: boolean;
  isSearching: boolean;

  // eslint-disable-next-line no-useless-escape
  private EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  @Input() team: Team;
  @Output() addMember = new EventEmitter<User>();

  @ViewChild('inputNewMember') public inputNewMember: ElementRef;

  constructor(
    private cd: ChangeDetectorRef,
    private datasetFactory: DatasetFactory,
    private userFactory: UserFactory,
    private teamFactory: TeamFactory,
    private userService: UserService,
    private analytics: Angulartics2Mixpanel,
    private intercom: Intercom,
  ) {
    this.inviteForm = new FormGroup({
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
    this.inputEmailSubscription = this.inputEmail$
      .pipe(
        debounceTime(250),
        tap(() => {
          this.isAlreadyInTeam = false;
          this.isShowSelectToAdd = false;
          this.isShowInviteForm = false;
          this.cd.markForCheck();
        }),
        filter((email) => this.isEmail(email)),
        tap((email: string) => {
          this.inputEmail = email;
          this.isSearching = true;
          this.cd.markForCheck();
        }),
        mergeMap((email) => {
          return this.userFactory.getAll(email);
        })
      )
      .subscribe((users: User[]) => {
        if (!isEmpty(users)) {
          this.foundUser = users[0];
          this.isShowSelectToAdd = true;
          this.isShowInviteForm = false;
        } else {
          this.isShowSelectToAdd = false;
          this.isShowInviteForm = true;
        }
        this.isSearching = false;
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    if (this.inputEmailSubscription) {
      this.inputEmailSubscription.unsubscribe();
    }
  }

  createUser() {
    if (this.inviteForm.dirty && this.inviteForm.valid) {
      this.isCreatingUser = true;
      const firstname = this.inviteForm.controls['firstname'].value;
      const lastname = this.inviteForm.controls['lastname'].value;
      const email = this.inviteForm.controls['email'].value;

      this.createUserFullDetails(email, firstname, lastname)
        .then(() => {
          this.addMember.emit(this.createdUser);
        })
        .then(() => {
          this.isCreatingUser = false;
          // this.inputNewMember.nativeElement.value = '';
          // this.inputEmail = '';
          this.isShowInviteForm = false;
          this.inviteForm.reset();
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

  onKeyUp(searchTextValue: string) {
    this.inputEmail$.next(searchTextValue);
  }

  addExistingUser(newUser: User) {
    if (this.isUserInTeam(newUser)) {
      this.isAlreadyInTeam = true;
      this.cd.markForCheck();
      return;
    }
    this.isAlreadyInTeam = false;
    newUser.teams.push(this.team.team_id);

    this.userFactory
      .upsert(newUser)
      .then((result: boolean) => {
        return result;
      })
      .then((result: boolean) => {
        if (result) {
          this.team.members.push(newUser);
          return this.team;
        }
      })
      .then((newTeam: Team) => {
        return this.teamFactory.upsert(newTeam).then(() => {
          return newTeam;
        });
      })
      .then((team: Team) => {
        this.analytics.eventTrack('Team', {
          action: 'add',
          team: team.name,
          teamId: team.team_id,
        });
      })
      .then(() => {
        this.addMember.emit(undefined);
      })
      .then(() => {
        this.inputNewMember.nativeElement.value = '';
        this.inputEmail = '';
        this.isShowSelectToAdd = false;
        this.cd.markForCheck();
      });
  }

  isUserInTeam(newUser: User) {
    return (
      this.team.members.findIndex((m) => m.user_id === newUser.user_id) >= 0
    );
  }

  isEmail(text: string) {
    return this.EMAIL_REGEXP.test(text);
  }

}
