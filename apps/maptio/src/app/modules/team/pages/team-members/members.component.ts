import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';

import {
  compact,
  remove,
  uniqBy,
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

  private membersSubject$: BehaviorSubject<User[]> = new BehaviorSubject([]);
  public readonly members$ = this.membersSubject$.asObservable();

  private routeSubscription: Subscription;

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
    this.routeSubscription = combineLatest([
      this.route.parent.data,
      this.userService.user$,
    ]).subscribe(
      async (data: [{ assets: { team: Team; datasets: DataSet[] } }, User]) => {
        this.team = data[0].assets.team;
        this.user = data[1];

        this.getAllMembers();
      }
    );
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  async getAllMembers() {
    try {
      this.loaderService.show();

      const memberIds = this.team.members.map((member) => member.user_id);
      let members = await this.userFactory.getUsers(memberIds);
      members = compact(members);

      if (this.createdUser) {
        this.createdUser.isActivationPending = true;
        this.createdUser.isInvitationSent = false;
        members.push(this.createdUser);
      }

      members = uniqBy(members, (member) => member.user_id);
      members = sortBy(members, (member) => member.name);

      this.updateCreatedUsersInIntercom(members.length);
      this.loaderService.hide();

      this.membersSubject$.next(members);
    } catch(error) {
      console.error('Error retrieving all members', error);
      this.cd.markForCheck();
      this.membersSubject$.next([]);
    }
  }

  onAddMember(createdUser?: User) {
    if (createdUser) {
      this.createdUser = createdUser;
    }

    this.getAllMembers();
  }

  deleteMember(user: User) {
    if (this.team.members.length === 1) return;
    remove(this.team.members, function (m) {
      return m.user_id === user.user_id;
    });
    this.cd.markForCheck();
    this.teamFactory.upsert(this.team).then(() => {
      this.getAllMembers();
    });
  }

  trackByMemberId(index: number, member: User) {
    return member.user_id;
  }

  private updateCreatedUsersInIntercom(numberOfCreatedUsers: number) {
    this.intercom.update({
      app_id: environment.INTERCOM_APP_ID,
      email: this.user.email,
      user_id: this.user.user_id,
      company: {
        company_id: this.team.team_id,
        created_users: numberOfCreatedUsers,
      },
    });
  }
}
