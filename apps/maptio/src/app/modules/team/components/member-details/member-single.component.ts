import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';

import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { Intercom } from 'ng-intercom';

import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { MultipleUserDuplicationError } from '@maptio-shared/services/user/multiple-user-duplication.error';
import {
  UserRole,
  Permissions,
} from '@maptio-shared/model/permission.data';
import { Team } from '@maptio-shared/model/team.data';
import { DuplicationError } from '@maptio-shared/services/user/duplication.error';


@Component({
  selector: 'maptio-member-single',
  templateUrl: './member-single.component.html',
  styleUrls: ['./member-single.component.css'],
})
export class MemberSingleComponent {
  UserRole = UserRole;
  Permissions = Permissions;

  @Input() team: Team;
  @Input() member: User;
  @Input() user: User;
  @Input() isOnlyMember: boolean;

  @Output() delete = new EventEmitter<User>();

  @Output() refreshMembersList = new EventEmitter<void>();

  isDisplaySendingLoader: boolean;
  isDisplayUpdatingLoader: boolean;
  isEditToggled: boolean;
  wasInvitationAttempted: boolean;
  showMultipleAdminsWarning: boolean;

  duplicateUsers: User[] = [];

  errorMessage: string;

  constructor(
    private cd: ChangeDetectorRef,
    private userService: UserService,
    private analytics: Angulartics2Mixpanel,
    private intercom: Intercom
  ) {}

  deleteMember() {
    this.delete.emit(this.member);
  }

  changeUserRole(userRoleString: string) {
    this.isDisplayUpdatingLoader = true;
    this.cd.markForCheck();

    const userRole = Number(userRoleString) as UserRole;

    if (userRole === UserRole.Admin) {
      this.showMultipleAdminsWarning = true;
    } else {
      this.showMultipleAdminsWarning = false;
    }

    this.userService
      .updateUserRole(this.member, userRole)
      .then(() => {
        this.isDisplayUpdatingLoader = false;
        this.refreshMembersList.emit();
        this.cd.markForCheck();
      });
  }

  inviteUser(): Promise<void> {
    this.wasInvitationAttempted = true;

    if (!this.member.email) {
      this.errorMessage = 'Please enter an email address to send the invitation to.';
      this.cd.markForCheck();
      return;
    }

    this.isDisplaySendingLoader = true;
    this.errorMessage = '';
    this.cd.markForCheck();

    return this.userService
      .sendInvite(
        this.member,
        this.team.name,
        this.user.name
      )
      .then((isSent) => {
        this.member.isInvitationSent = isSent;
        this.isDisplaySendingLoader = false;
        this.wasInvitationAttempted = false;
        this.cd.markForCheck();

        if (!isSent) {
          throw new Error();
        }

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
      })
      .catch((error) => {
        console.error('Error while sending invitation: ', error);

        if (error instanceof DuplicationError) {
          this.handleDuplicateUsers(error.duplicateUsers);
        } else if (error instanceof MultipleUserDuplicationError) {
          this.errorMessage = `
            More than one user with this email already exists. This is
            unexpected. Please contact us and we will address this issue.
          `;
        } else {
          this.errorMessage = `
            Something went wrong. Please try again later or contact us if the
            problem persists.
          `;
        }

        this.isDisplaySendingLoader = false;
        this.cd.markForCheck();
      });
  }

  handleDuplicateUsers(duplicateUsers: User[]) {
    this.isEditToggled = true;
    this.duplicateUsers = duplicateUsers;
  }

  onEditMember() {
    this.onCancelEditing();
  }

  onCancelEditing() {
    this.isEditToggled = false;
    this.cd.markForCheck();
  }

  // TODO: Copy over to MemberForm component (and fix "Never ago"!!!)
  // import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
  // getAgo(date: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  //   return date ? distanceInWordsToNow(date) : 'Never';
  // }
}
