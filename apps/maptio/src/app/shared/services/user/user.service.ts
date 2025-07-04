import { Injectable, OnDestroy, Inject, LOCALE_ID, DOCUMENT } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, combineLatest, EMPTY, from, of } from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilKeyChanged,
  filter,
  map,
  mergeMap,
  shareReplay,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { SubSink } from 'subsink';
import { AuthService } from '@auth0/auth0-angular';
import { Intercom } from '@supy-io/ngx-intercom';
import { UUID } from 'angular2-uuid/index';
import { isEmpty, remove, sortBy, uniq } from 'lodash-es';
import { nanoid } from 'nanoid';

import { environment } from '@maptio-environment';
import { UserFactory } from '@maptio-core/http/user/user.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { User, UserRoleArray } from '@maptio-shared/model/user.data';
import { OnboardingProgress } from '@maptio-shared/model/onboarding-progress.data';
import { Helper } from '@maptio-shared/model/helper.data';
import { Team } from '@maptio-shared/model/team.data';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { Initiative } from '@maptio-shared/model/initiative.data';
import { OpenReplayService } from '@maptio-shared/services/open-replay.service';
import { TeamService } from '@maptio-shared/services/team/team.service';
import { MapService } from '@maptio-shared/services/map/map.service';
import {
  UserRole,
  UserRoleService,
  Permissions,
} from '@maptio-shared/model/permission.data';
import { UserWithTeamsAndDatasets } from '@maptio-shared/model/userWithTeamsAndDatasets.interface';
import { LoaderService } from '@maptio-shared/components/loading/loader.service';

import { MultipleUserDuplicationError } from './multiple-user-duplication.error';
import { DuplicationError } from './duplication.error';

@Injectable()
export class UserService implements OnDestroy {
  // Keep auth variables in the user service for convenience, allowing us to
  // skip importing the Auth0 SDK in components
  public isAuthenticated$ = this.auth.isAuthenticated$;

  private permissions: Permissions[] = [];

  public userFromAuth0Profile$ = this.auth.user$.pipe(
    // Proceed only when Auth0 returns profile information
    filter((profile) => Boolean(profile)),

    // Limit unnecessary emissions, see discussion here:
    // https://github.com/auth0/auth0-angular/issues/105
    // and solution proposed here:
    // https://community.auth0.com/t/infinite-requests-when-piping-auth-user-in-angular-auth-o/57136/2
    distinctUntilKeyChanged('sub'),

    concatMap((profile) => {
      const userId = profile.sub;

      return from(this.userFactory.get(userId));
    }),

    withLatestFrom(this.auth.user$),
    concatMap(([user, profile]) => {
      if (user) {
        return of(user);
      } else {
        const newUser = this.createUserFromAuth0Signup(profile);
        return from(this.userFactory.create(newUser));
      }
    }),

    tap((user) => {
      if (user.consentForSessionRecordings) {
        this.openReplayService.start();
      }
    }),

    catchError((error) => this.handleLoginError(error)),

    // Cache the user
    shareReplay(1)
  );

  private refreshUserDataSubject = new BehaviorSubject<void>(null);
  public refreshUserDataAction$ = this.refreshUserDataSubject.asObservable();

  // Refresh user data every time it is requested
  public userWithTeamsAndDatasets$ = combineLatest([
    this.userFromAuth0Profile$,
    this.refreshUserDataAction$,
  ]).pipe(
    concatMap(([user]) => {
      return this.gatherUserData(user);
    })
  );

  public user$ = this.userWithTeamsAndDatasets$.pipe(
    map((userWithTeamsAndDatasets: UserWithTeamsAndDatasets) => {
      return userWithTeamsAndDatasets.user;
    })
  );

  userDatasets: DataSet[];

  constructor(
    // Current
    private http: HttpClient,
    private router: Router,
    private subs: SubSink,
    private auth: AuthService,
    private openReplayService: OpenReplayService,
    private intercomService: Intercom, // :'(
    private userFactory: UserFactory,
    private teamFactory: TeamFactory,
    private teamService: TeamService,
    private datasetFactory: DatasetFactory,
    private mapService: MapService,
    private userRoleService: UserRoleService,
    private loaderService: LoaderService,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(LOCALE_ID) public currentLocaleCode: string
  ) {
    // TODO: This is the solution to token expiry actually recommended by Auth0
    // here: https://github.com/auth0/auth0-angular#handling-errors but it's
    // ugly and it'd be great to improve on this
    this.subs.sink = this.auth.error$
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter((error) => (error as any).error === 'login_required'),
        mergeMap(() => this.login())
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  /*
   * Login, signup, logout and associated data preparation
   */

  login() {
    return this.auth.loginWithRedirect({
      ui_locales: this.getAuth0SupportedLocale(this.currentLocaleCode),
    });
  }

  /**
   * Get locale code from among those supported by Auth0
   *
   * Auth0 doesn't automatically switch from a regional language variation, so
   * we have to add custom logic for this. For example, specifying 'en-US' as
   * the language for the Auth0 interface will be ignored and, if the user has
   * a different language set in their browser, the Auth0 pages will be shown
   * in that language despite Maptio requesting they be showin in "en-US."
   */
  private getAuth0SupportedLocale(locale: string) {
    switch (locale) {
      case 'en-US':
        return 'en';
      case 'en-GB':
        return 'en';
      default:
        return locale;
    }
  }

  logout() {
    this.auth.logout({
      returnTo: this.doc.location.origin + '/logout?auth0=true',
    });
  }

  signup() {
    return this.auth.loginWithRedirect({
      screen_hint: 'signup',
      ui_locales: this.currentLocaleCode,
    });
  }

  private async gatherUserData(user: User): Promise<UserWithTeamsAndDatasets> {
    // This is very old code, which had the comment "HACK : where does the
    // duplication comes from?" next to it, copying it here, but at some
    // point, it'd be good to investigate the source of the duplication,
    // remove it, and clean up data
    const teamIds = uniq(user.teams);
    user.teams = teamIds;

    user.exampleTeamIds = await this.identifyExampleTeams(user);

    const datasetIds = await this.datasetFactory.get(user);
    user.datasets = uniq(datasetIds);

    let teams = isEmpty(user.teams)
      ? []
      : await this.teamFactory.get(user.teams);
    teams = sortBy(teams, (team) => team.name);

    this.userDatasets = isEmpty(user.datasets)
      ? []
      : await this.datasetFactory.get(user.datasets, false);
    let datasets = this.userDatasets
      .filter((dataset) => !dataset.isArchived)
      .map((dataset) => {
        dataset.team = teams.find(
          (team) => dataset.initiative.team_id === team.team_id
        );
        return dataset;
      });
    datasets = sortBy(datasets, (dataset) => dataset.initiative.name);

    return { datasets, teams, user };
  }

  private async identifyExampleTeams(user: User) {
    let exampleTeamIds = [];

    if (user.teams.length > 0) {
      const userTeams = await this.teamFactory.get(user.teams);
      exampleTeamIds = userTeams
        .filter((team) => team.isExample)
        .map((team) => team.team_id);
    }

    return exampleTeamIds;
  }

  private handleLoginError(error) {
    console.error(error);
    this.router.navigateByUrl('/login-error');
    this.loaderService.hide();
    return EMPTY;
  }

  /*
   * User data refresh
   */

  public refreshUserData() {
    this.refreshUserDataSubject.next();
  }

  /*
   * User creation
   */

  /**
   * This function is used whenever a user is being added to a team immediately
   * after being created
   */
  createUserAndAddToTeam(
    team: Team,
    email: string,
    firstname: string,
    lastname: string,
    picture: string,
    about: string
  ): Promise<User> {
    const userRoleMap = new Map([[team.team_id, UserRole.Standard]]);
    const userRole = Array.from(userRoleMap.entries());

    const userId = this.generateNewUserId();
    const user = this.createUser(
      userId,
      email,
      firstname,
      lastname,
      picture,
      about,
      userRole
    );

    return this.addTeamDataToUserObjectUserToTeamAndSaveBoth(team, user);
  }

  /**
   * This function is only used to create admin users from initial signups
   */
  private createUserFromAuth0Signup(profile): User {
    // Because this function is used early on in the onboarding process, we
    // don't have a team yet, so we use a placeholder team ID, which will be
    // replaced once the team is created
    const userRoleMap = this.teamService.createTemporaryUserRole();
    const userRole = Array.from(userRoleMap.entries());

    // Base user ID on what's in Auth0
    const userId = profile.sub;

    const about = '';

    const isInAuth0 = true;

    return this.createUser(
      userId,
      profile.email,
      profile.given_name,
      profile.family_name,
      profile.picture,
      about,
      userRole,
      isInAuth0
    );
  }

  /**
   * This is the function used by all the other user creation methods - it does
   * the actual work
   */
  private createUser(
    userId: string,
    email: string,
    firstname: string,
    lastname: string,
    picture: string,
    about: string,
    userRole: UserRoleArray,
    isInAuth0 = false
  ): User {
    const imageUrl = picture
      ? picture
      : this.generateUserAvatarLink(firstname, lastname);

    const newUserData = {
      isInAuth0,
      user_id: userId,
      name: `${firstname} ${lastname}`,
      firstname,
      lastname,
      email: email,
      picture: imageUrl,
      about,
      isActivationPending: true,
      isInvitationSent: false,
      isDeleted: false,
      lastSeenAt: undefined,
      createdAt: new Date().toISOString(),
      loginsCount: 0,
      userRole,
      onboardingProgress: {
        showEditingPanelMessage: true,
        showCircleDetailsPanelMessage: true,
        showCircleCanvasMessage: true,
        showOnboardingVideo: true,
      },
    };

    return User.create().deserialize(newUserData);
  }

  private addTeamDataToUserObjectUserToTeamAndSaveBoth(
    team: Team,
    user: User
  ): Promise<User> {
    return this.datasetFactory
      .get(team)
      .then(
        (datasets: DataSet[]) => {
          user.teams = [team.team_id];
          user.datasets = datasets.map((d) => d.datasetId);

          return user;
        },
        (reason) => {
          return Promise.reject(
            $localize`Can't create ${user.email} : ${reason}`
          );
        }
      )
      .then((user: User) => {
        this.userFactory.create(user);
        return user;
      })
      .then((user: User) => {
        team.members.push(user);
        this.teamFactory.upsert(team);
        return user;
      })
      .then((user: User) => {
        this.intercomService.trackEvent('Create user', {
          team: team.name,
          teamId: team.team_id,
          email: user.email,
        });
        return user;
      })
      .catch((reason) => {
        console.error(reason);
        throw Error(reason);
      });
  }

  /*
   * User creation: small helper methods
   */

  private generateNewUserId(): string {
    return this.addAuth0IdPrefix(nanoid());
  }

  private generateUserAvatarLink(firstname, lastname) {
    const nameForAvatar = lastname ? `${firstname}+${lastname}` : firstname;
    const color = this.getHexFromHsl(
      this.getHslFromName(`${firstname} ${lastname}`)
    );

    return `https://ui-avatars.com/api/?rounded=true&background=${color}&name=${nameForAvatar}&font-size=0.35&color=ffffff&size=500`;
  }

  private getHslFromName(name: string): { h: number; s: number; l: number } {
    const cleaned = name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      hash = cleaned.charCodeAt(i) + ((hash << 5) - hash);
    }

    return { h: hash % 360, s: 99, l: 35 };
  }

  private getHexFromHsl(hsl: { h: number; s: number; l: number }) {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `${toHex(r)}${toHex(g)}${toHex(b)}`.replace('-', '').substr(0, 6);
  }

  /**
   * Add the "auth0|" prefix to the user id
   *
   * When we create a user manually in the database first, before creating them
   * in Auth0, we still need the `user_id`, which later, after the user data is
   * sent to Auth0, will need to have the "auth0|" prefix. Therefore, we need
   * to add the prefix when creating the user, then remove it just before we
   * send the data to Auth0.
   *
   * TODO: Refactor this out once we have a consistent way of handling ids for
   * all objects
   */
  private addAuth0IdPrefix(userId: string): string {
    return `auth0|${userId}`;
  }

  /**
   * Remove the "auth0|" prefix from the user id
   *
   * See comment for method above for more details
   */
  private removeAuth0IdPrefix(userId: string): string {
    return userId.replace('auth0|', '');
  }

  /*
   * Updating user information
   */

  public async updateUser(
    user: User,
    firstname: string,
    lastname: string,
    email: string,
    picture: string,
    about: string,
    isActivationPending?: boolean
  ): Promise<boolean> {
    if (user.email !== email && user.isInAuth0) {
      throw new Error($localize`Cannot update email of user already in Auth0.`);
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.name = `${firstname} ${lastname}`;
    user.email = email;
    user.picture = picture;
    user.about = about;

    if (isActivationPending !== undefined) {
      user.isActivationPending = isActivationPending;
    }

    if (user.isInAuth0) {
      this.updateUserDataInIntercom(user);
    }

    return this.userFactory.upsert(user);
  }

  public updateUserEmail(user: User, email: string): Promise<boolean> {
    user.email = email;
    return this.userFactory.upsert(user);
  }

  public updateUserRole(
    user: User,
    team: Team,
    newUserRoleInOrganization: UserRole
  ): Promise<boolean> {
    user.setUserRole(team.team_id, newUserRoleInOrganization);
    return this.userFactory.upsert(user);
  }

  public updateUserOnboardingProgress(
    user: User,
    onboardingProgress: OnboardingProgress
  ): Promise<boolean> {
    user.onboardingProgress = onboardingProgress;
    return this.userFactory.upsert(user);
  }

  /*
   * Invitations
   */

  public async sendInvite(
    user: User,
    teamName: string,
    invitedBy: string
  ): Promise<boolean> {
    const duplicateUsers = await this.checkForDuplication(user);

    if (duplicateUsers.length > 0) {
      throw new DuplicationError(
        'Duplicate users have been found.',
        duplicateUsers
      );
    }

    const userDataInAuth0Format = this.convertUserToAuth0Format(user);

    // When first sending an invitation, we need to create a new user in Auth0,
    // unless the user is already there.
    const createUser = !user.isInAuth0;

    // When creating a user in Auth0, we need to remove the "auth0|" prefix,
    // from the user id, see comment for `addAuth0IdPrefix` for more details.
    if (createUser) {
      userDataInAuth0Format.user_id = this.removeAuth0IdPrefix(
        userDataInAuth0Format.user_id
      );
    }

    const inviteData = {
      userData: userDataInAuth0Format,
      teamName,
      invitedBy,
      createUser,
      languageCode: this.currentLocaleCode,
    };

    return this.http
      .post(`/api/v1/invite`, inviteData)
      .toPromise()
      .then((success) => {
        if (success) {
          return this.updateInvitationSentStatus(user, true);
        }
      });
  }

  private convertUserToAuth0Format(user: User) {
    const userInAuth0Format = {
      user_id: user.user_id,
      connection: environment.auth0DatabaseConnectionName,
      email: user.email,
      name: `${user.firstname} ${user.lastname}`,
      password: `${UUID.UUID()}-${UUID.UUID().toUpperCase()}`,
      // email_verified: !isSignUp || true,
      email_verified: false,
      verify_email: false, // we are always sending our emails (not through Auth0)
      app_metadata: {
        activation_pending: true,
        invitation_sent: false,
      },
      user_metadata: {
        picture: user.picture,
        given_name: user.firstname,
        family_name: user.lastname,
      },
    };

    return userInAuth0Format;
  }

  private async updateInvitationSentStatus(
    user: User,
    isInvitationSent: boolean
  ): Promise<boolean> {
    // TODO: We need to separate creating the user in Auth0 from invitation
    // sending more to be able to update these separately, otherwise there is a
    // small chance that a user will be in Auth0 but will not yet be invited
    // and so we will be trying to create them in Auth0 again and invitation
    // sending with fail!
    user.isInAuth0 = isInvitationSent;
    user.isInvitationSent = isInvitationSent;

    return this.userFactory.upsert(user);
  }

  /*
   * Detecting and handling duplication
   */

  public async checkForDuplicateTeamMembers(
    team: Team,
    email: string,
    firstname: string,
    lastname: string
  ): Promise<User[]> {
    const teamMembers = team.members;
    const name = `${firstname} ${lastname}`;
    let duplicateUsers: User[] = [];

    duplicateUsers = duplicateUsers.concat(
      teamMembers.filter((member) => {
        const areBothEmailsDefined = !!member.email && !!email;
        const doEmailsMatch = areBothEmailsDefined && member.email === email;
        const doNamesMatch = this.areStringsAlmostIdentical(member.name, name);

        return doEmailsMatch || doNamesMatch;
      })
    );

    return duplicateUsers;
  }

  private areStringsAlmostIdentical(string1: string, string2: string): boolean {
    return (
      string1.trim().localeCompare(
        string2.trim(),
        undefined, // locale not specified
        { sensitivity: 'base' } // case insensitive, among other things
      ) === 0
    );
  }

  public async checkForDuplication(user: User): Promise<User[]> {
    let duplicateUsers: User[] = [];

    if (user.email) {
      // Find all users in the DB with the same email address
      await this.userFactory
        .getAllByEmail(user.email)
        .then((usersWithGivenEmail) => {
          duplicateUsers = usersWithGivenEmail.filter(
            (userFromDB) => userFromDB.user_id !== user.user_id
          );
        });

      // Ignore users not already in Auth0
      duplicateUsers = duplicateUsers.filter(
        (userFromDB) => userFromDB.isInAuth0
      );

      if (duplicateUsers.length > 1) {
        throw new MultipleUserDuplicationError(
          $localize`We found multiple duplicated users with 'isInAuth0' set to 'true'.`
        );
      }
    }

    return duplicateUsers;
  }

  async replaceUserWithDuplicateAlreadyInAuth0(
    duplicateUsers: User[],
    userToBeReplaced: User,
    team: Team
  ) {
    if (duplicateUsers.length > 1) {
      throw new Error(`Cannot replace user with multiple duplicates.`);
    } else if (duplicateUsers.length === 0) {
      throw new Error(`No duplicate users found. Aborting replacing user.`);
    }

    const replacementUser = duplicateUsers[0];

    // Get datasets for the current team
    const teamDatasets = this.userDatasets.filter((dataset) => {
      if (!dataset.initiative) {
        return false;
      }

      return dataset.initiative.team_id === team.team_id;
    });

    const outdatedStatusForEachTeamDataset = await Promise.all(
      teamDatasets.map(async (dataset) =>
        this.mapService.isDatasetOutdated(dataset)
      )
    );
    const isAnyDatasetOutdated = outdatedStatusForEachTeamDataset.some(Boolean);

    if (isAnyDatasetOutdated) {
      alert(
        $localize`A friendly heads-up: One or more of your maps has been changed by another user (or by you in a different browser tab). Please hit refresh to load the latest version before adding an existing user. Sorry for the hassle.`
      );
      return;
    }

    await this.teamService.replaceMember(
      team,
      userToBeReplaced,
      replacementUser
    );

    teamDatasets.forEach(async (dataset) => {
      dataset.team = team;

      dataset.initiative.traverse((initiative: Initiative) => {
        if (this.isUserAccountableOfInitiative(userToBeReplaced, initiative)) {
          this.replaceUser(initiative.accountable, replacementUser);

          if (this.isUserAHelperInInitiative(replacementUser, initiative)) {
            remove(
              initiative.helpers,
              (helper) => helper.user_id === replacementUser.user_id
            );
          }
        }

        if (this.isUserAHelperInInitiative(userToBeReplaced, initiative)) {
          if (
            this.isUserAccountableOfInitiative(replacementUser, initiative) ||
            this.isUserAHelperInInitiative(replacementUser, initiative)
          ) {
            remove(
              initiative.helpers,
              (helper) => helper.user_id === userToBeReplaced.user_id
            );
          } else {
            initiative.helpers.forEach((helper) => {
              if (helper.user_id === userToBeReplaced.user_id) {
                this.replaceUser(helper, replacementUser);
              }
            });
          }
        }
      });

      try {
        await this.datasetFactory.upsert(dataset);
      } catch {
        throw new Error(
          $localize`Failed to update dataset while replacing duplicate users.`
        );
      }
    });

    // We need to do this to ensure that the team and dataset changes are
    // propagated
    this.refreshUserData();
  }

  private replaceUser(initiativeHelper: Helper, replacementUser: User) {
    initiativeHelper = Object.assign(initiativeHelper, replacementUser);
  }

  private isUserAccountableOfInitiative(user: User, initiative: Initiative) {
    return initiative.accountable?.user_id === user.user_id;
  }

  private isUserAHelperInInitiative(user: User, initiative: Initiative) {
    return initiative.helpers.some((helper) => helper.user_id === user.user_id);
  }

  /**
   * :'(
   */
  private updateUserDataInIntercom(user) {
    this.intercomService.update({
      app_id: environment.INTERCOM_APP_ID,
      email: user.email,
      user_id: user.user_id,
      name: user.name,
      first_name: user.firstname,
      'First Name': user.firstname,
      'Last Name': user.lastname,
      avatar: {
        type: 'avatar',
        image_url: user.picture,
      },
      is_invited: user.isInvitationSent,
      consent_for_session_recordings: user.consentForSessionRecordings,
    });
  }
}
