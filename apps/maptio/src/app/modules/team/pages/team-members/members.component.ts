import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';

import { Subject, Subscription } from 'rxjs';
import {
  mergeMap,
  filter,
  tap,
  debounceTime,
  combineLatest,
} from 'rxjs/operators';

import {
  compact,
  remove,
  uniqBy,
  differenceBy,
  sortBy,
  isEmpty,
} from 'lodash-es';
import { Intercom } from 'ng-intercom';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';

import { environment } from '@maptio-config/environment';
import { Auth } from '@maptio-core/authentication/auth.service';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { UserFactory } from '@maptio-core/http/user/user.factory';

import { DataSet } from '@maptio-shared/model/dataset.data';
import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { UserRole, Permissions } from '@maptio-shared/model/permission.data';
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
  UserRole = UserRole;
  Permissions = Permissions;

  public members$: Promise<User[]>;
  public newMember: User;
  private routeSubscription: Subscription;
  private inputEmailSubscription: Subscription;
  public isAlreadyInTeam = false;
  public errorMessage: string;

  public invite$: Subject<void> = new Subject<void>();

  public resentMessage: string;
  public isCreatingUser: boolean;
  public invitableUsersCount: number;
  public inviteAllUsersMessage: string;

  public createdUser: User;
  public inviteForm: FormGroup;
  cancelClicked: boolean;

  inputEmail$: Subject<string> = new Subject();
  inputEmail: string;
  foundUser: User;
  isShowSelectToAdd: boolean;
  isShowInviteForm: boolean;
  isSearching: boolean;
  isNewUserAdded: boolean;

  // eslint-disable-next-line no-useless-escape
  private EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

  constructor(
    private route: ActivatedRoute,
    private userFactory: UserFactory,
    private userService: UserService,
    private teamFactory: TeamFactory,
    private datasetFactory: DatasetFactory,
    private analytics: Angulartics2Mixpanel,
    private intercom: Intercom,
    private cd: ChangeDetectorRef,
    private loaderService: LoaderService,
    private auth: Auth
  ) {
    this.inviteForm = new FormGroup({
      firstname: new FormControl('', {
        validators: [Validators.required, Validators.minLength(2)],
        updateOn: 'submit',
      }),
      lastname: new FormControl('', {
        validators: [Validators.required, Validators.minLength(2)],
        updateOn: 'submit',
      }),
    });
  }

  @ViewChild('inputNewMember') public inputNewMember: ElementRef;

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

    // this.userSubscription = this.auth.getUser().subscribe(u => this.user = u);
  }

  ngOnDestroy() {
    // if (this.userSubscription) {
    //     this.userSubscription.unsubscribe();
    // }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.inputEmailSubscription) {
      this.inputEmailSubscription.unsubscribe();
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

  isUserInTeam(newUser: User) {
    return (
      this.team.members.findIndex((m) => m.user_id === newUser.user_id) >= 0
    );
  }

  closeAlreadyInTeamAlert() {
    this.inputNewMember.nativeElement.value = '';
    this.foundUser = null;
    this.isShowSelectToAdd = false;
    this.isAlreadyInTeam = false;
    this.cd.markForCheck();
  }

  addUser(newUser: User) {
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
        this.members$ = this.getAllMembers();
      })
      .then(() => {
        this.inputNewMember.nativeElement.value = '';
        this.inputEmail = '';
        this.isShowSelectToAdd = false;
        this.cd.markForCheck();
      });
  }

  isEmail(text: string) {
    return this.EMAIL_REGEXP.test(text);
  }

  inviteAll() {
    this.invite$.next();
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

  createUser(email: string) {
    if (this.inviteForm.dirty && this.inviteForm.valid) {
      this.isCreatingUser = true;
      const firstname = this.inviteForm.controls['firstname'].value;
      const lastname = this.inviteForm.controls['lastname'].value;

      this.createUserFullDetails(email, firstname, lastname)
        .then(() => {
          this.members$ = this.getAllMembers();
        })
        .then(() => {
          this.isCreatingUser = false;
          this.inputNewMember.nativeElement.value = '';
          this.inputEmail = '';
          this.isShowInviteForm = false;
          this.inviteForm.reset();
          this.cd.markForCheck();
        });
    }
  }

  createUserFullDetails(email: string, firstname: string, lastname: string) {
    // return this.team$.then((team: Team) => {

    // })

    return this.userService
      .createUser(email, firstname, lastname)
      .then(
        (user: User) => {
          return this.datasetFactory.get(this.team).then(
            (datasets: DataSet[]) => {
              const virtualUser = new User();
              virtualUser.name = user.name;
              virtualUser.email = user.email;
              virtualUser.firstname = user.firstname;
              virtualUser.lastname = user.lastname;
              virtualUser.nickname = user.nickname;
              virtualUser.user_id = user.user_id;
              virtualUser.picture = user.picture;
              virtualUser.teams = [this.team.team_id];
              virtualUser.datasets = datasets.map((d) => d.datasetId);
              this.createdUser = virtualUser;

              return virtualUser;
            },
            (reason) => {
              return Promise.reject(`Can't create ${email} : ${reason}`);
            }
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (reason: any) => {
          throw JSON.parse(reason._body).message;
        }
      )
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

  trackByMemberId(index: number, member: User) {
    return member.user_id;
  }
}
