import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import { UUID } from 'angular2-uuid/index';
import { flatten } from 'lodash-es';
import { nanoid } from 'nanoid'

import { AuthConfiguration } from '@maptio-core/authentication/auth.config';
import { UserFactory } from '@maptio-core/http/user/user.factory';
import { EmitterService } from '@maptio-core/services/emitter.service';
import { environment } from '@maptio-config/environment';

import { UserRole } from './../../model/permission.data';
import { User } from './../../model/user.data';
import { JwtEncoder } from '../encoding/jwt.service';
import { MailingService } from '../mailing/mailing.service';


@Injectable()
export class UserService {
  constructor(
    private http: HttpClient,
    private configuration: AuthConfiguration,
    private encodingService: JwtEncoder,
    private mailing: MailingService,
    private userFactory: UserFactory
  ) {}

  // TODO: Replace calls to this with the function below
  // eslint-disable-next-line
  public createUserPlaceholder(...args): any {
    console.error('TODO');
  }

  public createUser(
    email: string,
    firstname: string,
    lastname: string,
    isSignUp?: boolean,
    isAdmin?: boolean
  ): User {
    const color = this.getHexFromHsl(
      this.getHslFromName(`${firstname} ${lastname}`)
    );

    const newUser = {
      isInAuth0: false,
      user_id: 'auth0|' + nanoid(), // The "auth0|" prefix is necessary - see comment below
      connection: environment.CONNECTION_NAME,
      email: email,
      name: `${firstname} ${lastname}`,
      password: `${UUID.UUID()}-${UUID.UUID().toUpperCase()}`,
      email_verified: !isSignUp || true,
      verify_email: false, // we are always sending our emails (not through Auth0)
      app_metadata: {
        activation_pending: true,
        invitation_sent: false,
        role: isAdmin ? UserRole[UserRole.Admin] : UserRole[UserRole.Standard],
      },
      user_metadata: {
        picture: `https://ui-avatars.com/api/?rounded=true&background=${color}&name=${firstname}+${lastname}&font-size=0.35&color=ffffff&size=500`,

        given_name: firstname,
        family_name: lastname,
      },
    };

    // const user = User.create();
    const user = User.create().deserialize(newUser);

    return user;
  }

  public createUserInAuth0(user: User): Promise<boolean> {
    if (!user.email) {
      const errorMessage = 'Cannot create Auth0 user without an email address.';
      console.error(errorMessage);
      return Promise.reject(errorMessage);
    }

    const userDataInAuth0Format = this.convertUserToAuth0Format(user);

    // Auth0 will add the "auth0|" prefix automatically, so to ensure that our
    // id matches the Auth0 id, we need to remove the prefix temporarily
    userDataInAuth0Format.user_id = user.user_id.replace('auth0|', '');

    return this.configuration.getAccessToken()
      .then((token: string) => {
        const httpOptions = {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + token,
          }),
        };

        return this.http
          .post(environment.USERS_API_URL, userDataInAuth0Format, httpOptions)
          .pipe(
            map((responseData) => {
              return responseData;
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map((input: any) => {
              return User.create().deserialize(input);
            })
          )
          // Save to DB
          .pipe(
            mergeMap(() => {
              return this.userFactory.get(user.user_id);
            }),
            mergeMap((newUser) => {
              newUser.isInAuth0 = true;
              return this.userFactory.upsert(newUser);
            })
          )
          .toPromise();
    });
  }

  public sendInvite(
    user: User,
    teamName: string,
    invitedBy: string
  ): Promise<boolean> {
    return Promise.all([
      this.generateDetailedUserToken(user),
      this.configuration.getAccessToken(),
    ])
      .then(([userToken, apiToken]: [string, string]) => {
        if (user.isInAuth0) {
          return [userToken, apiToken];
        } else {
          return this.createUserInAuth0(user).then((success: boolean) => {
            if (!success) {
              // TODO: Deal with this in some better way...
              console.error('Error creating user in Auth0 or saving the updated user...');
            }
            return [userToken, apiToken];
          });
        }
      })
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
              result_url: 'http://app.maptio.com/login?token=' + userToken,
              user_id: user.user_id,
              ttl_sec: 30 * 24 * 3600, // valid for 30 days
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
        return this.mailing.sendInvitation(
          environment.SUPPORT_EMAIL,
          [user.email],
          ticket,
          teamName,
          invitedBy
        );
      })
      .then((success: boolean) => {
        return this.updateInvitiationSentStatus(user.user_id, true);
      });
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
      this.configuration.getAccessToken(),
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
              result_url: 'http://app.maptio.com/login?token=' + userToken,
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
      this.configuration.getAccessToken(),
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
              result_url: 'http://app.maptio.com/login?token=' + userToken,
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

  public getUsersInfo(users: Array<User>): Promise<Array<User>> {
    if (users.length === 0)
      return Promise.reject('You must specify some user ids.');

    const query = users.map((u) => `user_id:"${u.user_id}"`).join(' OR ');

    return this.configuration.getAccessToken().then((token: string) => {
      const headers = new HttpHeaders({
        Authorization: 'Bearer ' + token,
      });

      // we can get all users at once
      if (users.length <= environment.AUTH0_USERS_PAGE_LIMIT) {
        return this.requestUsersPerPage(query, headers, 0).toPromise();
      } else {
        // query several times
        const maxCounter = Math.ceil(
          users.length / environment.AUTH0_USERS_PAGE_LIMIT
        );

        const pageArrays = Array.from(Array(maxCounter).keys());
        const singleObservables = pageArrays.map(
          (pageNumber: number, index: number) => {
            const truncatedQuery = users
              .slice(
                index * environment.AUTH0_USERS_PAGE_LIMIT,
                (index + 1) * environment.AUTH0_USERS_PAGE_LIMIT
              )
              .map((u) => `user_id:"${u.user_id}"`)
              .join(' OR ');
            return this.requestUsersPerPage(
              truncatedQuery,
              headers,
              pageNumber
            ).pipe(
              map((single) => {
                return single;
              })
            );
          }
        );

        return observableForkJoin(singleObservables)
          .toPromise()
          .then((result: User[][]) => {
            return flatten(result);
          });
      }
    });
  }

  private requestUsersPerPage(
    query: string,
    headers: HttpHeaders,
    page: number
  ): Observable<User[]> {
    const httpOptions = { headers };
    return this.http
      .get(
        `${environment.USERS_API_URL}?q=${encodeURIComponent(
          query
        )}&search_engine=v3`,
        httpOptions
      )
      .pipe(
        map((responseData) => {
          return responseData;
        }),
        map((inputs: Array<any>) => {
          const result: Array<User> = [];
          if (inputs) {
            inputs.forEach((input) => {
              result.push(User.create().deserialize(input));
            });
          }
          return result;
        })
      );
  }

  public isActivationPendingByUserId(user_id: string): Promise<boolean> {
    return this.configuration.getAccessToken().then((token: string) => {
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
    return this.configuration.getAccessToken().then((token: string) => {
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
    return this.configuration.getAccessToken().then((token: string) => {
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
    return this.configuration.getAccessToken().then((token: string) => {
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
    return this.configuration.getAccessToken().then((token: string) => {
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
    return this.configuration.getAccessToken().then((token: string) => {
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
    return this.configuration.getAccessToken().then((token: string) => {
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

  public updateInvitiationSentStatus(
    user_id: string,
    isInvitationSent: boolean
  ): Promise<boolean> {
    return this.configuration.getAccessToken().then((token: string) => {
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + token,
        }),
      };

      return this.http
        .patch(
          `${environment.USERS_API_URL}/${user_id}`,
          { app_metadata: { invitation_sent: isInvitationSent } },
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

  public updateUserRole(user_id: string, userRole: string): Promise<boolean> {
    return this.configuration.getAccessToken().then((token: string) => {
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
    this.configuration.getWebAuth().changePassword(
      {
        connection: environment.CONNECTION_NAME,
        email: email,
      },
      function (err, resp) {
        if (err) {
          EmitterService.get('changePasswordFeedbackMessage').emit(err.error);
        } else {
          EmitterService.get('changePasswordFeedbackMessage').emit(resp);
        }
      }
    );
  }

  public isUserExist(email: string): Promise<boolean> {
    return this.configuration.getAccessToken().then((token: string) => {
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
