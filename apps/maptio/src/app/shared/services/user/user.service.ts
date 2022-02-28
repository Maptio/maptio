import { Injectable, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  EMPTY,
  from,
  of,
} from 'rxjs';
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
import { UUID } from 'angular2-uuid/index';
import { isEmpty, sortBy, uniq } from 'lodash-es';
import { nanoid } from 'nanoid'

import { environment } from '@maptio-config/environment';
import { UserFactory } from '@maptio-core/http/user/user.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { User } from '@maptio-shared/model/user.data';
import { UserRole, UserRoleService, Permissions } from '@maptio-shared/model/permission.data';
import { UserWithTeamsAndDatasets } from '@maptio-shared/model/userWithTeamsAndDatasets.interface';
import { LoaderService } from '@maptio-shared/components/loading/loader.service';


@Injectable()
export class UserService implements OnDestroy {
  // Keep auth variables in the user service for convenience, allowing us to
  // skip importing the Auth0 SDK in components
  public isAuthenticated$ = this.auth.isAuthenticated$;

  private permissions: Permissions[] = [];

  public userFromAuth0Profile$ = this.auth.user$.pipe(
    // Proceed only when Auth0 returns profile information
    filter(profile => Boolean(profile)),

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

    catchError(this.handleLoginError),

    // Cache the user
    shareReplay(1),
  );

  // Refresh user data every time it is requested
  public userWithTeamsAndDatasets$ = this.userFromAuth0Profile$.pipe(
    concatMap((user) => {
      return this.gatherUserData(user);
    }),
  )

  public user$ = this.userWithTeamsAndDatasets$.pipe(
    map((userWithTeamsAndDatasets: UserWithTeamsAndDatasets) => {
      return userWithTeamsAndDatasets.user;
    }),
  );

  constructor(
    // Current
    private http: HttpClient,
    private router: Router,
    private subs: SubSink,
    private auth: AuthService,
    private userFactory: UserFactory,
    private teamFactory: TeamFactory,
    private datasetFactory: DatasetFactory,
    private userRoleService: UserRoleService,
    private loaderService: LoaderService,
    @Inject(DOCUMENT) private doc: Document,
  ) {
    // TODO: This is the solution to token expiry actually recommended by Auth0
    // here: https://github.com/auth0/auth0-angular#handling-errors but it's
    // ugly and it'd be great to improve on this
    this.subs.sink = this.auth.error$.pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter(error => (error as any).error === 'login_required'),
      mergeMap(() => this.login())
    ).subscribe();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  /*
   * Login, signup, logout and associated data preparation
   */

  login() {
    return this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({
      returnTo: this.doc.location.origin + '/logout?auth0=true',
    });
  }

  signup() {
    return this.auth.loginWithRedirect({
      screen_hint: 'signup'
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

    this.permissions = this.userRoleService.get(user.userRole);

    const datasetIds = await this.datasetFactory.get(user);
    user.datasets = uniq(datasetIds)

    let teams = isEmpty(user.teams) ? [] : await this.teamFactory.get(user.teams);
    teams = sortBy(teams, team => team.name);

    let datasets = isEmpty(user.datasets) ? [] : await this.datasetFactory.get(user.datasets, false);
    datasets = datasets
      .filter(dataset => !dataset.isArchived)
      .map(dataset => {
        dataset.team = teams.find(team => dataset.initiative.team_id === team.team_id);
        return dataset;
      });
    datasets = sortBy(datasets, dataset => dataset.initiative.name);

    return { datasets, teams, user };
  }

  private async identifyExampleTeams(user: User) {
    let exampleTeamIds = [];

    if (user.teams.length > 0) {
      const userTeams = await this.teamFactory.get(user.teams);
      exampleTeamIds = userTeams
        .filter(team => team.isExample)
        .map(team => team.team_id)
    }

    return exampleTeamIds;
  }

  private handleLoginError(error) {
    console.error(error);
    this.router.navigateByUrl('/login-error');
    this.loaderService.hide();
    return EMPTY;
  }

  public getPermissions(): Permissions[] {
    return this.permissions;
  }

  public getAccessToken() {
    return Promise.resolve('TODO');
  }


  /*
   * User creation
   */

  // TODO: Replace calls to this with the function below
  // eslint-disable-next-line
  public createUserPlaceholder(...args): any {
    console.error('TODO');
  }

  createUserFromAuth0Signup(profile): User {
    return this.createUser(
      profile.sub,
      profile.email,
      profile.given_name,
      profile.family_name,
      profile.picture,
      true,
    );
  }

  createUserFromMemberForm(
    email: string,
    firstname: string,
    lastname: string,
    picture: string,
    isAdmin?: boolean
  ): User {
    const userId = this.generateNewUserId();
    return this.createUser(userId, email, firstname, lastname, picture, isAdmin);
  }

  private createUser(
    userId: string,
    email: string,
    firstname: string,
    lastname: string,
    picture?: string,
    isAdmin?: boolean
  ): User {
    const imageUrl = picture ? picture : this.generateUserAvatarLink(firstname, lastname);

    const newUserData = {
      isInAuth0: false,
      user_id: userId,
      name: `${firstname} ${lastname}`,
      firstname,
      lastname,
      email: email,
      picture: imageUrl,
      isActivationPending: true,
      isInvitationSent: false,
      isDeleted: false,
      lastSeenAt: undefined,
      createdAt: new Date().toISOString(),
      loginsCount: 0,
      userRole: isAdmin ? UserRole[UserRole.Admin] : UserRole[UserRole.Standard],
    };

    return User.create().deserialize(newUserData);
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
   * See comment for mehtod above for more details
   */
  private removeAuth0IdPrefix(userId: string): string {
    return userId.replace('auth0|', '');
  }


  /*
   * Invitations
   */

  public sendInvite(
    user: User,
    teamName: string,
    invitedBy: string
  ): Promise<boolean> {
    const userDataInAuth0Format = this.convertUserToAuth0Format(user);

    // When first sending an invitation, we need to create a new user in Auth0,
    // unless the user is already there (like with old data) or they are already
    // in Auth0.
    const createUser = !user.isInAuth0;

    // When creating a user in Auth0, we need to remove the "auth0|" prefix,
    // from the user id, see comment for `addAuth0IdPrefix` for more details.
    if (createUser) {
      userDataInAuth0Format.user_id = this.removeAuth0IdPrefix(userDataInAuth0Format.user_id);
    }

    const inviteData = {
      userData: userDataInAuth0Format,
      teamName,
      invitedBy,
      createUser,
    }

    return this.http
      .post(`/api/v1/invite`, inviteData)
      .toPromise()
      .then(success => {
        if (success) {
          return this.updateInvitationSentStatus(user, true);
        }
      })
  }












  public isInvitationSent(...args): any {
    console.error('TODO: isInvitationSent');
  }


  public async updateUser(
    user: User,
    firstname: string,
    lastname: string,
    email: string,
    picture: string,
    isActivationPending?: boolean,
  ): Promise<boolean> {
    if (user.email !== email && user.isInAuth0) {
      throw new Error('Cannot update email of user already in Auth0.');
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.picture = picture;

    if (isActivationPending !== undefined) {
      user.isActivationPending = isActivationPending;
    }

    return this.userFactory.upsert(user);
  }

  public async updateInvitationSentStatus(
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

  public updateUserRole(user: User, userRole: UserRole): Promise<boolean> {
    user.userRole = userRole;
    return this.userFactory.upsert(user);
  }

  private convertUserToAuth0Format(user: User) {
    const userInAuth0Format = {
      user_id: user.user_id,
      connection: environment.CONNECTION_NAME,
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
    }

    return userInAuth0Format;
  }
}

// TODO: Use this code (that used to be part of the authorize page) to get
// metadata from Auth0
// private updateMetadata(profile: any): Observable<User> {
//   let picture: string, firstName: string, lastName: string;

//   let user = User.create().deserialize(profile);

//   let userId = user.user_id;
//   let identities = profile.identities.length;
//   let googleIdentity = profile.identities.find((i: any) => i.provider === "google-oauth2");

//   if (googleIdentity) {
//       if (identities === 1) {
//           picture = profile.picture;
//           firstName = profile.given_name;
//           lastName = profile.family_name;
//       }
//       else {
//           picture = googleIdentity.profileData.picture;
//           firstName = googleIdentity.profileData.given_name;
//           lastName = googleIdentity.profileData.family_name;
//       }
//   } else {
//       picture = googleIdentity.profileData.picture;
//       firstName = googleIdentity.profileData.given_name;
//       lastName = googleIdentity.profileData.family_name;
//   }

//   return observableForkJoin(
//           this.userService.updateUserPictureUrl(userId, picture),
//           this.userService.updateUserProfilePlaceholder(userId, firstName, lastName)).pipe(
//       switchMap(() => {
//           return observableFrom(this.userService.getUsersInfo([user]))
//       }),
//       map(users => users[0]),)

// }
