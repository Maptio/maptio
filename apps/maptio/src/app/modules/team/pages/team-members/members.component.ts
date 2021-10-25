import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject, Subscription } from 'rxjs';
import {
  combineLatest,
} from 'rxjs/operators';

import {
  compact,
  remove,
  uniqBy,
  differenceBy,
  sortBy,
} from 'lodash-es';
import { Intercom } from 'ng-intercom';

import { environment } from '@maptio-config/environment';
import { Auth } from '@maptio-core/authentication/auth.service';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { UserFactory } from '@maptio-core/http/user/user.factory';

import { DataSet } from '@maptio-shared/model/dataset.data';
import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { Permissions } from '@maptio-shared/model/permission.data';
import { Team } from '@maptio-shared/model/team.data';
import { LoaderService } from '@maptio-shared/components/loading/loader.service';


@Component({
  selector: 'maptio-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css'],
})
export class TeamMembersComponent implements OnInit, OnDestroy {
  team: Team;
  user: User;
  Permissions = Permissions;

  public members$: Promise<User[]>;
  private routeSubscription: Subscription;

  public invite$: Subject<void> = new Subject<void>();

  public invitableUsersCount: number;
  public inviteAllUsersMessage: string;

  public createdUser: User;
  cancelClicked: boolean;

  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

  constructor(
    private route: ActivatedRoute,
    private userFactory: UserFactory,
    private userService: UserService,
    private teamFactory: TeamFactory,
    private intercom: Intercom,
    private cd: ChangeDetectorRef,
    private loaderService: LoaderService,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.parent.data
      .pipe(combineLatest(this.auth.getUser()))
      .subscribe(
        (data: [{ assets: { team: Team; datasets: DataSet[] } }, User]) => {
          this.team = data[0].assets.team;
          this.user = data[1];
          this.members$ = this.getAllMembers();
        }
      );
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  getAllMembers() {
    this.loaderService.show();
    return this.userFactory
      .getUsers(this.team.members.map((m) => m.user_id))
      .then((members) => compact(members))
      .then((members: User[]) => {
        return this.userService.getUsersInfo(members).then((pending) => {
          if (this.createdUser) {
            this.createdUser.isActivationPending = true;
            this.createdUser.isInvitationSent = false;
            pending.push(this.createdUser);
          }

          return { members: members, membersPending: pending };
        });
      })
      .then((result) => {
        const members = result.members;

        const membersPending = uniqBy(result.membersPending, (m) => m.user_id);
        const allDeleted = differenceBy(
          members,
          membersPending,
          (m) => m.user_id
        ); //.map(m => { m.isDeleted = true; return m });

        return membersPending.concat(allDeleted);
      })
      .then((members) => {
        this.invitableUsersCount = members.filter(
          (m) => m.isActivationPending
        ).length;
        this.inviteAllUsersMessage = `Are you sure you want to send an invitation email to these
    ${this.invitableUsersCount} people?`;
        return sortBy(members, (m) => m.name);
      })
      .then((members) => {
        this.intercom.update({
          app_id: environment.INTERCOM_APP_ID,
          email: this.user.email,
          user_id: this.user.user_id,
          company: {
            company_id: this.team.team_id,
            created_users: members.length,
          },
        });
        this.loaderService.hide();
        return members;
      })
      .catch(() => {
        this.cd.markForCheck();
        this.loaderService.hide();
        return [];
      });
    // });
  }

  inviteAll() {
    this.invite$.next();
  }

  onAddMember(createdUser?: User) {
    if (createdUser) {
      this.createdUser = createdUser;
    }
    this.members$ = this.getAllMembers();
  }

  deleteMember(user: User) {
    if (this.team.members.length === 1) return;
    remove(this.team.members, function (m) {
      return m.user_id === user.user_id;
    });
    this.cd.markForCheck();
    this.teamFactory.upsert(this.team).then(() => {
      this.members$ = this.getAllMembers();
    });
  }

  trackByMemberId(index: number, member: User) {
    return member.user_id;
  }
}
