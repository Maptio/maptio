import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';

import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { Intercom } from 'ng-intercom';
import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import {
  UserRole,
  Permissions,
} from '@maptio-shared/model/permission.data';
import { Team } from '@maptio-shared/model/team.data';


@Component({
  selector: 'maptio-member-single',
  templateUrl: './member-single.component.html',
  styleUrls: ['./member-single.component.css'],
})
export class MemberSingleComponent implements OnInit, OnDestroy {
  UserRole = UserRole;
  Permissions = Permissions;

  @Input() team: Team;
  @Input() member: User;
  @Input() user: User;
  @Input() isOnlyMember: boolean;
  @Input() invite: Observable<User>;

  @Output() delete = new EventEmitter<User>();

  isDisplaySendingLoader: boolean;
  isDisplayUpdatingLoader: boolean;
  isSaving: boolean;
  isSavingSuccess: boolean;
  savingFailedMessage: string;
  subscription: Subscription;
  editUserForm: FormGroup;
  isEditToggled: boolean;

  constructor(
    private cd: ChangeDetectorRef,
    private userService: UserService,
    private analytics: Angulartics2Mixpanel,
    private intercom: Intercom
  ) {}

  ngOnInit(): void {
    this.subscription = this.invite.subscribe(() => {
      if (this.member.isActivationPending) {
        this.inviteUser();
      }
    });

    this.editUserForm = new FormGroup({
      firstname: new FormControl(
        {
          value: this.member.firstname,
          disabled: !this.member.isActivationPending,
        },
        {
          validators: [Validators.required],
          updateOn: 'change',
        }
      ),
      lastname: new FormControl(
        {
          value: this.member.lastname,
          disabled: !this.member.isActivationPending,
        },
        {
          validators: [Validators.required],
          updateOn: 'change',
        }
      ),
      email: new FormControl(
        {
          value: this.member.email,
          disabled:
            !this.member.isActivationPending || this.member.isInvitationSent,
        },
        {
          validators: [Validators.required, Validators.email],
          updateOn: 'change',
        }
      ),
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  deleteMember() {
    this.delete.emit(this.member);
  }

  changeUserRole(userRole: UserRole) {
    this.isDisplayUpdatingLoader = true;
    this.cd.markForCheck();
    this.userService
      .updateUserRole(this.member.user_id, UserRole[userRole])
      .then(() => {
        this.isDisplayUpdatingLoader = false;
        this.cd.markForCheck();
      });
  }

  inviteUser(): Promise<void> {
    this.isDisplaySendingLoader = true;
    this.cd.markForCheck();
    return this.userService
      .sendInvite(
        this.member.email,
        this.member.user_id,
        this.member.firstname,
        this.member.lastname,
        this.member.name,
        this.team.name,
        this.user.name
      )
      .then((isSent) => {
        this.member.isInvitationSent = isSent;
        this.isDisplaySendingLoader = false;
        this.cd.markForCheck();
        return;
      })
      .then(() => {
        this.analytics.eventTrack('Team', {
          action: 'invite',
          team: this.team.name,
          teamId: this.team.team_id,
        });
        return;
      })
      .then(() => {
        this.intercom.trackEvent('Invite user', {
          team: this.team.name,
          teamId: this.team.team_id,
          email: this.member.email,
        });
        return;
      });
  }

  getAgo(date: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return date ? distanceInWordsToNow(date) : 'Never';
  }

  updateUser() {
    if (this.editUserForm.valid) {
      this.isSaving = true;
      this.savingFailedMessage = null;
      this.isSavingSuccess = false;
      this.cd.markForCheck();

      const firstname = this.editUserForm.controls['firstname'].value;
      const lastname = this.editUserForm.controls['lastname'].value;
      const email = this.editUserForm.controls['email'].value;

      this.userService
        .updateUserProfile(this.member.user_id, firstname, lastname)
        .then((updated: boolean) => {
          if (updated) {
            this.member.firstname = firstname;
            this.member.lastname = firstname;
            this.member.name = `${firstname} ${lastname}`;
          } else {
            this.savingFailedMessage = 'Cannot update user profile';
          }
        })
        .then(() => {
          if (
            this.editUserForm.controls['email'].dirty ||
            this.editUserForm.controls['email'].touched
          ) {
            return this.userService
              .updateUserEmail(this.member.user_id, email)
              .then((updated) => {
                if (updated) {
                  this.member.email = email;
                  this.isSavingSuccess = true;
                  this.cd.markForCheck();
                }
              });
          } else {
            this.isSavingSuccess = true;
            this.cd.markForCheck();
          }
        })
        .then(() => {
          this.isSaving = false;
          this.cd.markForCheck();
        })
        .catch((err) => {
          console.error(err);
          this.isSaving = false;
          this.isSavingSuccess = false;
          this.savingFailedMessage = JSON.parse(err._body).message;
          this.cd.markForCheck();
        });
    }
  }
}
