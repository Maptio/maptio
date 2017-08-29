import { Http, Headers } from "@angular/http";
import { ErrorService } from "../error/error.service";
import { Router } from "@angular/router";
import { UserFactory } from "../user.factory";
import { Injectable } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";
import { UUID } from "angular2-uuid/index";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { User } from "../../model/user.data";
import { AuthConfiguration } from "./auth.config";

@Injectable()
export class Auth {

    private user$: Subject<User>;
    private _http: Http;

    constructor(private http: Http, public lock: AuthConfiguration, public userFactory: UserFactory, private router: Router, private errorService: ErrorService) {
        this._http = http;
        this.user$ = new Subject();
        this.lock.getLock().on("authenticated", (authResult: any) => {
            localStorage.setItem("id_token", authResult.idToken);

            let pathname_object: any = JSON.parse(authResult.state);
            let pathname: any = localStorage.getItem(pathname_object.pathname_key) || "";
            localStorage.removeItem(pathname_object.pathname_key);

            this.lock.getLock().getProfile(authResult.idToken, (error: any, profile: any) => {
                if (error) {
                    alert(error);
                    return;
                }


                this.setUser(profile).then((isSucess: boolean) => {
                    if (isSucess) {
                        this.userFactory.get(profile.user_id)
                            .then((user: User) => {
                                this.user$.next(user);
                                return user;
                            })

                        this.router.navigate([pathname], {})
                            .catch((reason: any) => { errorService.handleError(reason) });
                    }
                    else {
                        errorService.handleError("Something has gone wrong ! Try again ?");
                    }
                })

                this.lock.getLock().hide();
            });

        });
    }

    public setUser(profile: any): Promise<boolean> {
        localStorage.setItem("profile", JSON.stringify(profile));

        return this.userFactory.get(profile.user_id)
            .then((user) => {
                this.user$.next(user);
                return Promise.resolve<boolean>(true);
            })
            .catch((reason: any) => {

                let user = User.create().deserialize(profile);
                this.userFactory.upsert(user)
                    .then(() => { return Promise.resolve<boolean>(true); })
                    .catch(() => { return Promise.resolve<boolean>(false); });  // adds the user in the database
                this.user$.next(user);
                return Promise.resolve<boolean>(true);

                // return this.userFactory.getAll(profile.email).then((users: User[]) => {
                //   if (users.length === 1) {
                //     // if we can find their emails in the database (i.e. they were "virtual users")
                //     // we switch their user info (name, picture, nickname, etc) and keep their datasets/teams intact

                //     let invitedUser = new User({
                //       user_id: profile.user_id, isVirtual: false,
                //       email: profile.email, name: profile.name,
                //       nickname: profile.nickname, picture: profile.picture
                //     });

                //     return this.userFactory.switchUserIds(users[0], invitedUser)
                //       .then(() => { return Promise.resolve<boolean>(true); })
                //       .catch(() => { return Promise.resolve<boolean>(false); });
                //   }
                //   if (users.length === 0) {
                //     // if we cannot find their email, they are a brand new user
                //     // create them with their profile
                //     console.log("brand new user", profile)
                //     let user = User.create().deserialize(profile);
                //     return this.userFactory.upsert(user)
                //       .then(() => { console.log("branc new user creation success"); return Promise.resolve<boolean>(true); })
                //       .catch(() => { console.log("branc new user creation failure"); return Promise.resolve<boolean>(false); });
                //   }
                //   throw new Error("There are more than one users with email " + profile.email)
                // });


                // adds the user in the database

                // this.user$.next(user);
                // return Promise.resolve<boolean>(true);
            });
    }



    public login() {
        let uuid = UUID.UUID();
        localStorage.setItem(uuid, localStorage.getItem("redirectUrl"));
        this.lock.getLock().show({
            auth: {
                params: {
                    scope: "openid name email",
                    state: JSON.stringify({ pathname_key: uuid })
                }
            }
        });
    };

    public authenticated() {
        return tokenNotExpired();
    }

    public logout() {
        localStorage.clear();
        this.clear();
    }

    public clear() {
        this.user$.next(undefined);
    }

    public getUser(): Observable<User> {
      
        let profileString = localStorage.getItem("profile");
        console.log("getUser", profileString)
        if (profileString) {
            this.userFactory.get(JSON.parse(profileString).user_id).then((user) => {
              console.log(user)
                this.user$.next(user)
            });
        }
        else {
            this.clear();
        }
        return this.user$.asObservable();
    }


    getApiToken(): Promise<string> {
        return this.http.post(
            "https://circlemapping.auth0.com/oauth/token",
            {
                "client_id": "mjQumlN564UkegYxzZGLNhM0umeEsmdC",
                "client_secret": "YHMsevargwqFXmBt7I0rAjjkhCz_yQ6gb8-g4YLwQRvKI_B2at22r0MUmyENEXZ_",
                "audience": "https://circlemapping.auth0.com/api/v2/",
                "grant_type": "client_credentials"
            }).map((responseData) => {
                return responseData.json().access_token;
            }).toPromise();
    }

    public createUser(email: string, name: string): Promise<User> {
        let newUser = {
            "connection": "Username-Password-Authentication",
            "email": email,
            "name": name,
            "password": UUID.UUID(),
            "email_verified": false,
            "verify_email": true
        }

        return this.getApiToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);
          console.log("https://circlemapping.auth0.com/api/v2/users", newUser, headers)
            return this.http.post("https://circlemapping.auth0.com/api/v2/users", newUser, { headers: headers })
                .map((responseData) => {
                    return responseData.json();
                })
                .map((input: any) => {
                    return User.create().deserialize(input);
                })
                .toPromise()
                .then(r => r)
                .catch(this.errorService.handleError);
        });
    }

}