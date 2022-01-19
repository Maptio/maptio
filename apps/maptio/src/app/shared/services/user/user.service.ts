import { Injectable, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  BehaviorSubject,
  forkJoin as observableForkJoin,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';

import { SubSink } from 'subsink';
import { AuthService } from '@auth0/auth0-angular';
import { UUID } from 'angular2-uuid/index';
import { isEmpty, flatten, sortBy, uniq } from 'lodash-es';
import { nanoid } from 'nanoid'

import { environment } from '@maptio-config/environment';
import { UserFactory } from '@maptio-core/http/user/user.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { User } from '@maptio-shared/model/user.data';
import { UserRole, UserRoleService, Permissions } from '@maptio-shared/model/permission.data';
import { UserWithTeamsAndDatasets } from '@maptio-shared/model/userWithTeamsAndDatasets.interface';

import { JwtEncoder } from '../encoding/jwt.service';
import { MailingService } from '../mailing/mailing.service';


@Injectable()
export class UserService implements OnDestroy {
  // Keep auth variables in the user service for convenience, allowing us to
  // skip importing the Auth0 SDK in components
  public isAuthenticated$ = this.auth.isAuthenticated$;

  private userSubject$: BehaviorSubject<User> = new BehaviorSubject(undefined);
  public readonly user$ = this.userSubject$.asObservable();

  private permissions: Permissions[] = [];

  private userWithTeamsAndDatasetsSubject$: BehaviorSubject<UserWithTeamsAndDatasets> = new BehaviorSubject(undefined);
  public readonly userWithTeamsAndDatasets$ = this.userWithTeamsAndDatasetsSubject$.asObservable();

  constructor(
    // Current
    private http: HttpClient,
    private subs: SubSink,
    private auth: AuthService,
    private userFactory: UserFactory,
    private teamFactory: TeamFactory,
    private datasetFactory: DatasetFactory,
    private userRoleService: UserRoleService,
    @Inject(DOCUMENT) private doc: Document,

    // Old, to be removed?
    private encodingService: JwtEncoder,
    private mailing: MailingService,
  ) {
    // TODO: This can be written much more cleanly - we've got some code
    // duplication and API call duplication that it'd be great to avoid with
    // some cleaner reactive code
    this.prepareUserDataBasedOnAuthenticatedUser();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }


  /*
   * Login, signup, logout and associated data preparation
   */

  login() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({
      returnTo: this.doc.location.origin + '/logout?auth0=true',
    });
  }

  signup() {
    this.auth.loginWithRedirect({
      screen_hint: 'signup'
    });
  }

  // TODO: This is almost identical to processAuth0Login, we should refactor
  // to DRY this up, though it might makes sense to leave this until state
  // management can be improved
  private prepareUserDataBasedOnAuthenticatedUser() {
    this.subs.sink = this.auth.user$.subscribe(async profile => {
      if (!profile) {
        // User is not logged in, no more data prep to do
        return;
      }

      // User is logged in through Auth0, let's process it
      const userId = profile.sub;

      // TODO: Handle error here!
      const user = await this.userFactory.get(userId);

      if (!user) {
        // User is not in our database
        // TODO: Handle this error
        console.error('User not found in database')
        return;
      }

      // User is in our database, let's make all associated data available
      const userWithDatasetsAndTeams = await this.gatherUserData(user);

      this.userSubject$.next(userWithDatasetsAndTeams.user);
      this.userWithTeamsAndDatasetsSubject$.next(userWithDatasetsAndTeams);
    });
  }

  // TODO: This is almost identical to prepareUserDataBasedOnAuthenticatedUser,
  // we should refactor to DRY this up, though it might makes sense to leave
  // this until state management can be improved
  async processAuth0Login() {
    this.subs.sink = this.auth.user$.subscribe(async profile => {
      if (!profile) {
        // User is not logged in, let's change that
        this.login();
        return;
      }

      // User is logged in through Auth0, let's process it
      const userId = profile.sub;

      // TODO: Handle error here!
      const user = await this.userFactory.get(userId);

      if (!user) {
        // User is not in our database
        const user = this.createUserFromAuth0Signup(profile);
        this.userFactory.create(user);
        return;
      }
    });
  }

  private async gatherUserData(user): Promise<UserWithTeamsAndDatasets> {
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

  public getPermissions(): Permissions[] {
    return this.permissions;
  }

  // TODO: Remove when ready...
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
      true,
      true,
    );
  }

  createUserFromMemberForm(
    email: string,
    firstname: string,
    lastname: string,
    isAdmin?: boolean
  ): User {
    const userId = this.generateNewUserId();
    return this.createUser(userId, email, firstname, lastname, false, isAdmin);
  }

  private createUser(
    userId: string,
    email: string,
    firstname: string,
    lastname: string,
    isEmailVerified?: boolean,
    isAdmin?: boolean
  ): User {
    const color = this.getHexFromHsl(
      this.getHslFromName(`${firstname} ${lastname}`)
    );

    const nameForAvatar = lastname ? `${firstname}+${lastname}` : firstname;

    const newUser = {
      isInAuth0: false,
      user_id: userId,
      connection: environment.CONNECTION_NAME,
      email: email,
      name: `${firstname} ${lastname}`,
      password: `${UUID.UUID()}-${UUID.UUID().toUpperCase()}`,
      email_verified: isEmailVerified,
      verify_email: false, // we are always sending our emails (not through Auth0)
      app_metadata: {
        activation_pending: true,
        invitation_sent: false,
        role: isAdmin ? UserRole[UserRole.Admin] : UserRole[UserRole.Standard],
      },
      user_metadata: {
        picture: `https://ui-avatars.com/api/?rounded=true&background=${color}&name=${nameForAvatar}&font-size=0.35&color=ffffff&size=500`,

        given_name: firstname,
        family_name: lastname,
      },
    };

    // const user = User.create();
    const user = User.create().deserialize(newUser);

    return user;
  }

  private generateNewUserId(): string {
    return this.addAuth0IdPrefix(nanoid());
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

  public sendInvite(
    user: User,
    teamName: string,
    invitedBy: string
  ): Promise<boolean> {
    const userDataInAuth0Format = this.convertUserToAuth0Format(user);

    // See comment for `removeAuth0IdPrefix` for more details
    if (!user.isInAuth0) { // Only necessary when first creating user
      userDataInAuth0Format.user_id = this.removeAuth0IdPrefix(userDataInAuth0Format.user_id);
    }

    const inviteData = {
      userData: userDataInAuth0Format,
      teamName,
      invitedBy,
      createUser: !user.isInAuth0,
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

  public sendConfirmation(
    email: string,
    userId: string,
    firstname: string,
    lastname: string,
    name: string
  ): Promise<boolean> {
    return Promise.all([
      this.encodingService.encode({
        user_id: userId,
        email: email,
        firstname: firstname,
        lastname: lastname,
        name: name,
      }),
      this.getAccessToken(),
    ])
      .then(([userToken, apiToken]: [string, string]) => {
        const httpOptions = {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + apiToken,
          }),
        };

        return this.http
          .post(
            environment.TICKETS_API_URL,
            {
              result_url: this.getAuth0RedirectBackUrl(userToken),
              user_id: userId,
            },
            httpOptions
          )
          .pipe(
            map((responseData: any) => {
              return <string>responseData.ticket;
            })
          )
          .toPromise();
      })
      .then((ticket: string) => {
        return this.mailing.sendConfirmation(
          environment.SUPPORT_EMAIL,
          [email],
          ticket
        );
      })
      .then((success: boolean) => {
        return this.updateActivationPendingStatus(userId, true);
      });
  }

  public sendConfirmationWithUserToken(userToken: string): Promise<boolean> {
    const getUserId = () => {
      return this.encodingService
        .decode(userToken)
        .then((decoded) => decoded.user_id);
    };
    const getUserEmail = () => {
      return this.encodingService
        .decode(userToken)
        .then((decoded) => decoded.email);
    };

    return Promise.all([
      getUserId(),
      getUserEmail(),
      this.getAccessToken(),
    ])
      .then(([userId, email, apiToken]: [string, string, string]) => {
        const httpOptions = {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + apiToken,
          }),
        };

        return this.http
          .post(
            environment.TICKETS_API_URL,
            {
              result_url: this.getAuth0RedirectBackUrl(userToken),
              user_id: userId,
            },
            httpOptions
          )
          .pipe(
            map((responseData: any) => {
              return {
                ticket: <string>responseData.ticket,
                email: email,
                userId: userId,
              };
            })
          )
          .toPromise();
      })
      .then((data: { ticket: string; email: string; userId: string }) => {
        return this.mailing.sendConfirmation(
          environment.SUPPORT_EMAIL,
          [data.email],
          data.ticket
        );
      })
      .then(() => {
        return getUserId();
      })
      .then((userId: string) => {
        return this.updateActivationPendingStatus(userId, true);
      });
  }

  private generateDetailedUserToken(user: User): Promise<string> {
    return this.encodingService.encode({
      user_id: user.user_id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      name: user.name,
    });
  }

  public generateUserToken(
    userId: string,
    email: string,
    firstname: string,
    lastname: string
  ): Promise<string> {
    return this.encodingService.encode({
      user_id: userId,
      email: email,
      firstname: firstname,
      lastname: lastname,
    });
  }

  /**
   * URL used by Auth0 to redirect user back to Maptio
   */
  private getAuth0RedirectBackUrl(userToken: string) {
    return `${window.location.protocol}//${window.location.hostname}` +
      `${window.location.port === '' ? '' : `:${window.location.port}`}` +
      `/login?token=${userToken}`;
  }

  private getHslFromName(name: string): { h: number; s: number; l: number } {
    const cleaned = name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      hash = cleaned.charCodeAt(i) + ((hash << 5) - hash);
    }

    return { h: hash % 360, s: 99, l: 35 };
  }

  getHexFromHsl(hsl: { h: number; s: number; l: number }) {
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

  public async getUsersInfo(users: Array<User>): Promise<Array<User>> {
    if (users.length === 0)
      return Promise.reject('You must specify some user ids.');

    const query = users.map((u) => `user_id:"${u.user_id}"`).join(' OR ');

    // const users = await this.userFactory.getUsers(users).then((users: Array<User>) => {
    // });

    // const query = users.map((u) => `user_id:"${u.user_id}"`).join(' OR ');

    // console.log(560);
    // return this.getAccessToken().then((token: string) => {
    //   const headers = new HttpHeaders({
    //     Authorization: 'Bearer ' + token,
    //   });

    //   // we can get all users at once
    //   if (users.length <= environment.AUTH0_USERS_PAGE_LIMIT) {
    //     return this.requestUsersPerPage(query, headers, 0).toPromise();
    //   } else {
    //     // query several times
    //     const maxCounter = Math.ceil(
    //       users.length / environment.AUTH0_USERS_PAGE_LIMIT
    //     );

    //     const pageArrays = Array.from(Array(maxCounter).keys());
    //     const singleObservables = pageArrays.map(
    //       (pageNumber: number, index: number) => {
    //         const truncatedQuery = users
    //           .slice(
    //             index * environment.AUTH0_USERS_PAGE_LIMIT,
    //             (index + 1) * environment.AUTH0_USERS_PAGE_LIMIT
    //           )
    //           .map((u) => `user_id:"${u.user_id}"`)
    //           .join(' OR ');
    //         return this.requestUsersPerPage(
    //           truncatedQuery,
    //           headers,
    //           pageNumber
    //         ).pipe(
    //           map((single) => {
    //             return single;
    //           })
    //         );
    //       }
    //     );

    //     return observableForkJoin(singleObservables)
    //       .toPromise()
    //       .then((result: User[][]) => {
    //         return flatten(result);
    //       });
    //   }
    // });
  }

  // private requestUsersPerPage(
  //   query: string,
  //   headers: HttpHeaders,
  //   page: number
  // ): Observable<User[]> {
  //   const httpOptions = { headers };
  //   return this.http
  //     .get(
  //       `${environment.USERS_API_URL}?q=${encodeURIComponent(
  //         query
  //       )}&search_engine=v3`,
  //       httpOptions
  //     )
  //     .pipe(
  //       map((responseData) => {
  //         return responseData;
  //       }),
  //       map((inputs: Array<any>) => {
  //         const result: Array<User> = [];
  //         if (inputs) {
  //           inputs.forEach((input) => {
  //             result.push(User.create().deserialize(input));
  //           });
  //         }
  //         return result;
  //       })
  //     );
  // }

  public isActivationPendingByUserId(user_id: string): Promise<boolean> {
    return this.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .get(`${environment.USERS_API_URL}/` + user_id, httpOptions)
        .pipe(
          map((responseData: any) => {
            if (responseData.app_metadata) {
              return responseData.app_metadata.activation_pending;
            }
            return false;
          })
        )
        .toPromise();
    });
  }

  public isActivationPendingByEmail(
    email: string
  ): Promise<{ isActivationPending: boolean; user_id: string }> {
    return this.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .get(
          `${environment.USERS_API_URL}?include_totals=true&search_engine=v3&q=` +
            encodeURIComponent(`email:"${email}"`),
          httpOptions
        )
        .pipe(
          map((responseData: any) => {
            if (responseData.total === 0) {
              return { isActivationPending: false, user_id: undefined };
            }
            if (responseData.total === 1) {
              const user = responseData.users[0];
              return user.app_metadata
                ? {
                    isActivationPending: user.app_metadata.activation_pending,
                    user_id: user.user_id,
                  }
                : { isActivationPending: false, user_id: user.user_id };
            }
            // return Promise.reject("There is more than one user with this email")
          })
        )
        .toPromise();
    });
  }

  public isInvitationSent(user_id: string): Promise<boolean> {
    return this.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .get(`${environment.USERS_API_URL}/${user_id}`, httpOptions)
        .pipe(
          map((responseData: any) => {
            if (responseData.app_metadata) {
              return responseData.app_metadata.invitation_sent;
            }
            return false;
          })
        )
        .toPromise();
    });
  }

  public updateUserCredentials(
    user_id: string,
    password: string,
    firstname: string,
    lastname: string
  ): Promise<boolean> {
    return this.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .patch(
          `${environment.USERS_API_URL}/${user_id}`,
          {
            password: password,
            user_metadata: {
              given_name: firstname,
              family_name: lastname,
            },
            connection: environment.CONNECTION_NAME,
          },
          httpOptions
        )
        .toPromise()
        .then(
          (response) => {
            return true;
          },
          (error) => {
            return Promise.reject('Cannot update user credentials');
          }
        );
    });
  }

  // TODO: Replace calls to this with the function below
  // eslint-disable-next-line
  public updateUserProfilePlaceholder(...args): any {
    console.error('TODO');
  }

  public async updateUser(
    user: User,
    firstname: string,
    lastname: string,
    email: string,
  ): Promise<boolean> {
    if (user.email !== email && user.isInAuth0) {
      try {
        await this.updateUserEmailInAuth0(user.user_id, email);
      } catch (error) {
        throw new Error(error);
      }
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;

    return this.userFactory.upsert(user);
  }

  private updateUserEmailInAuth0(user_id: string, email: string): Promise<boolean> {
    return this.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .patch(
          `${environment.USERS_API_URL}/${user_id}`,
          {
            email: email,
            // this can only be called if the user is "Not invited" so changing
            // their email shoudn't retrigger a verification
            email_verified: true,
            connection: environment.CONNECTION_NAME,
          },
          httpOptions
        )
        .toPromise()
        .then(
          (response) => {
            return true;
          },
          (error) => {
            return Promise.reject(error);
          }
        );
    });
  }

  public updateUserPictureUrl(
    user_id: string,
    pictureUrl: string
  ): Promise<boolean> {
    return this.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .patch(
          `${environment.USERS_API_URL}/${user_id}`,
          {
            user_metadata: {
              picture: pictureUrl,
            },
            connection: this.getConnection(),
          },
          httpOptions
        )
        .toPromise()
        .then(
          (response) => {
            return true;
          },
          (error) => {
            return Promise.reject('Cannot update user picture');
          }
        );
    });
  }

  public updateActivationPendingStatus(
    user_id: string,
    isActivationPending: boolean
  ): Promise<boolean> {
    return this.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .patch(
          `${environment.USERS_API_URL}/${user_id}`,
          { app_metadata: { activation_pending: isActivationPending } },
          httpOptions
        )
        .toPromise()
        .then(
          (response) => {
            return true;
          },
          (error) => {
            return Promise.reject('Cannot update user credentials');
          }
        );
    });
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

  public updateUserRole(user_id: string, userRole: string): Promise<boolean> {
    return this.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .patch(
          `${environment.USERS_API_URL}/${user_id}`,
          { app_metadata: { role: userRole } },
          httpOptions
        )
        .pipe(
          map((responseData) => {
            return true;
          })
        )
        .toPromise();
    });
  }

  public changePassword(email: string): void {
    // this.configuration.getWebAuth().changePassword(
    //   {
    //     connection: environment.CONNECTION_NAME,
    //     email: email,
    //   },
    //   function (err, resp) {
    //     if (err) {
    //       EmitterService.get('changePasswordFeedbackMessage').emit(err.error);
    //     } else {
    //       EmitterService.get('changePasswordFeedbackMessage').emit(resp);
    //     }
    //   }
    // );
  }

  public isUserExist(email: string): Promise<boolean> {
    return this.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .get(
          `${environment.USERS_API_URL}?include_totals=true&search_engine=v3&q=` +
            encodeURIComponent(`email:"${email}"`),
          httpOptions
        )
        .pipe(
          map((responseData: any) => {
            if (responseData.total) {
              return responseData.total === 1;
            }
            return false;
          })
        )
        .toPromise();
    });
  }

  /**
   * Get name of Auth0 connection for currently logged in user
   *
   * Every user in Auth0 has at least one identity, each with its own
   * connection. When updating user information we need to provide the name of
   * the connection. For users who don't have the default connection stored in
   * the CONNECTION_NAME environment variable, we need to return the name of
   * the google OAuth 2 connection to update user information.
   *
   * For more information, see: https://auth0.com/docs/identityproviders
   */
  getConnection() {
    const profileString = localStorage.getItem('profile');

    let profile;
    try {
      profile = JSON.parse(profileString);
    } catch (err) {
      console.error('Error while parsing profile json: ');
      console.error(err);
    }

    // Regardless what happens with the profile, try the default connection
    if (!profile || !profile.identities) {
      return environment.CONNECTION_NAME;
    }

    const numberOfIdentities = profile.identities.length;
    const googleIdentity = profile.identities.find(
      (identity: any) => identity.provider === 'google-oauth2'
    );

    if (numberOfIdentities === 1 && googleIdentity) {
      return 'google-oauth2';
    } else {
      return environment.CONNECTION_NAME;
    }
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
