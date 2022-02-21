import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';

import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { Intercom } from 'ng-intercom';

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
export class MemberSingleComponent implements OnInit {
  UserRole = UserRole;
  Permissions = Permissions;

  @Input() team: Team;
  @Input() member: User;
  @Input() user: User;
  @Input() isOnlyMember: boolean;

  @Output() delete = new EventEmitter<User>();

  isDisplaySendingLoader: boolean;
  isDisplayUpdatingLoader: boolean;
  isEditToggled: boolean;

  errorMessage: string;

  constructor(
    private cd: ChangeDetectorRef,
    private userService: UserService,
    private analytics: Angulartics2Mixpanel,
    private intercom: Intercom
  ) {}

  ngOnInit(): void {
    console.log('TODO');
    // TODO: Compare validation / disabled fields to MemberFormComponent
    // this.editUserForm = new FormGroup({
    //   firstname: new FormControl(
    //     {
    //       value: this.member.firstname,
    //       disabled: !this.member.isActivationPending,
    //     },
    //     {
    //       validators: [Validators.required],
    //       updateOn: 'change',
    //     }
    //   ),
    //   lastname: new FormControl(
    //     {
    //       value: this.member.lastname,
    //       disabled: !this.member.isActivationPending,
    //     },
    //     {
    //       validators: [Validators.required],
    //       updateOn: 'change',
    //     }
    //   ),
    //   email: new FormControl(
    //     {
    //       value: this.member.email,
    //       disabled:
    //         !this.member.isActivationPending || this.member.isInvitationSent,
    //     },
    //     {
    //       validators: [Validators.required, Validators.email],
    //       updateOn: 'change',
    //     }
    //   ),
    // });
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

        this.isDisplaySendingLoader = false;
        this.errorMessage = 'Something went wrong. Please try again later or contact us if the problem persists.';
        this.cd.markForCheck();
      });
  }

  // TODO: Copy over to MemberForm component (and fix "Never ago"!!!)
  // import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
  // getAgo(date: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  //   return date ? distanceInWordsToNow(date) : 'Never';
  // }
}
