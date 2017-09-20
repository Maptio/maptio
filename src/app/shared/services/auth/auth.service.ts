import { EmitterService } from "./../emitter.service";
import { MailingService } from "./../mailing/mailing.service";
import { JwtEncoder } from "./../encoding/jwt.service";
import { Http, Headers } from "@angular/http";
import { ErrorService } from "../error/error.service";
import { Router } from "@angular/router";
import { UserFactory } from "../user.factory";
import { Injectable, EventEmitter } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";
import { UUID } from "angular2-uuid/index";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { User } from "../../model/user.data";
import { AuthConfiguration } from "./auth.config";
import { WebAuth } from "auth0-js"

@Injectable()
export class Auth {

    private user$: Subject<User>;
    private _http: Http;

    constructor(private http: Http, public lock: AuthConfiguration,
        public userFactory: UserFactory, private router: Router, private errorService: ErrorService,
        public encodingService: JwtEncoder, public mailing: MailingService) {
        this._http = http;
        this.user$ = new Subject();
        // this.lock.getLock().on("authenticated", (authResult: any) => {
        //     localStorage.setItem("id_token", authResult.idToken);

        //     let pathname_object: any = JSON.parse(authResult.state);
        //     let pathname: any = localStorage.getItem(pathname_object.pathname_key) || "";
        //     localStorage.removeItem(pathname_object.pathname_key);

        //     this.lock.getLock().getProfile(authResult.idToken, (error: any, profile: any) => {
        //         if (error) {
        //             alert(error);
        //             return;
        //         }

        //         this.setUser(profile).then((isSucess: boolean) => {
        //             if (isSucess) {
        //                 this.userFactory.get(profile.user_id)
        //                     .then((user: User) => {
        //                         this.user$.next(user);
        //                         return user;
        //                     })

        //                 this.router.navigate([pathname], {})
        //                     .catch((reason: any) => { errorService.handleError(reason) });
        //             }
        //             else {
        //                 errorService.handleError("Something has gone wrong ! Try again ?");
        //             }
        //         })

        //         this.lock.getLock().hide();
        //     });

        // });
    }

    public setUser(profile: any): Promise<boolean> {
        // console.log("setUser", profile)
        localStorage.setItem("profile", JSON.stringify(profile));

        return this.userFactory.get(profile.user_id)
            .then((user) => {
                // console.log("getting user", user)
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

            });
    }



    // public login() {
    //     let uuid = UUID.UUID();
    //     localStorage.setItem(uuid, localStorage.getItem("redirectUrl"));
    //     this.lock.getLock().show({
    //         auth: {
    //             params: {
    //                 scope: "openid name email",
    //                 state: JSON.stringify({ pathname_key: uuid })
    //             }
    //         }
    //     });
    // };

    public login(email: string, password: string): Promise<boolean> {

        try {
            this.lock.getWebAuth().client.login({
                realm: "Username-Password-Authentication",
                username: email,
                password: password,
                scope: "profile openid email"
            }, function (err: any, authResult: any) {
                if (err) {
                    // console.log(err)
                    EmitterService.get("loginErrorMessage").emit(err.description);
                    return;
                }
                localStorage.setItem("id_token", authResult.idToken);
                // console.log(authResult)
                if (authResult.accessToken) {
                    this.lock.getWebAuth().client.userInfo(authResult.accessToken, function (err: Error, profile: any) {
                        profile.user_id = profile.sub;
                        profile.sub = undefined;
                        this.setUser(profile).then((isSuccess: boolean) => {
                            if (isSuccess) {
                                this.userFactory.get(profile.user_id)
                                    .then((user: User) => {
                                        this.user$.next(user);
                                        return user;
                                    })
                                    .then((user: User) => {
                                        let redirectUrl = localStorage.getItem("redirectUrl");
                                        this.router.navigateByUrl(redirectUrl ? redirectUrl : "/home");
                                    })
                            }
                            else {
                                this.errorService.handleError("Something has gone wrong ! Try again ?");
                            }
                        })
                    }.bind(this))
                }
            }.bind(this));

        } catch (error) {
            return Promise.reject(error)
        }



    }

    public apiAuthenticated() {
        return tokenNotExpired("access_token");
    }


    public authenticated(): boolean {
        return tokenNotExpired();
    }

    public logout(): void {
        localStorage.clear();
        // this.clear();
        this.router.navigate(["home"]);
    }

    public isEmailVerified(userId: string): Promise<boolean> {
        // console.log("isEmailVerified")
        return this.lock.getApiToken().then((token: string) => {
            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);
            return this.http.get("https://circlemapping.auth0.com/api/v2/users/" + userId, { headers: headers })
                .map((responseData) => {
                    return responseData.json().email_verified === "true";
                })
                .toPromise()
                .then(r => r)
                .catch(this.errorService.handleError);
        });
    }

    public isFirstLogin(userId: string): Promise<boolean> {
        // console.log("isFIrstLogin")
        return this.lock.getApiToken().then((token: string) => {
            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);
            return this.http.get("https://circlemapping.auth0.com/api/v2/users/" + userId, { headers: headers })
                .map((responseData) => {
                    return responseData.json().logins_count === 0;
                })
                .toPromise()
                .then(r => r)
                .catch(this.errorService.handleError);
        });
    }


    public clear() {
        this.user$.next(undefined);
    }

    public getUser(): Observable<User> {
        let profileString = localStorage.getItem("profile");
        // console.log("getUser", profileString)
        if (profileString) {
            this.userFactory.get(JSON.parse(profileString).user_id).then((user) => {
                // console.log(user)
                this.user$.next(user)
            });
        }
        else {
            this.clear();
        }
        return this.user$.asObservable();
    }





    public sendInvite(email: string, userId: string, firstname: string, lastname: string, name: string, teamName: string, invitedBy: string): Promise<boolean> {

        return Promise.all([
            this.encodingService.encode({ user_id: userId, email: email, firstname: firstname, lastname: lastname, name: name }),
            this.lock.getApiToken()]
        ).then(([userToken, apiToken]: [string, string]) => {
            let headers = new Headers();
            headers.set("Authorization", "Bearer " + apiToken);
            return this.http.post(
                "https://circlemapping.auth0.com/api/v2/tickets/email-verification",
                {
                    "result_url": "http://app.maptio.com/home?token=" + userToken,
                    "user_id": userId
                },
                { headers: headers })
                .map((responseData) => {
                    return <string>responseData.json().ticket;
                }).toPromise()
        })
            .then((ticket: string) => {
                return this.mailing.sendInvitation("support@maptio.com", [email], ticket, teamName, invitedBy)
            })
            .then((success: boolean) => {
                return this.updateInvitiationSentStatus(userId, true);
            });
    }

    public sendConfirmation(email: string, userId: string, firstname: string, lastname: string, name: string): Promise<boolean> {

        return Promise.all([
            this.encodingService.encode({ user_id: userId, email: email, firstname: firstname, lastname: lastname, name: name }),
            this.lock.getApiToken()]
        ).then(([userToken, apiToken]: [string, string]) => {
            let headers = new Headers();
            headers.set("Authorization", "Bearer " + apiToken);
            return this.http.post(
                "https://circlemapping.auth0.com/api/v2/tickets/email-verification",
                {
                    "result_url": "http://app.maptio.com/login?token=" + userToken,
                    "user_id": userId
                },
                { headers: headers })
                .map((responseData) => {
                    return <string>responseData.json().ticket;
                }).toPromise()
        })
            .then((ticket: string) => {
                return this.mailing.sendConfirmation("support@maptio.com", [email], ticket)
            })
            .then((success: boolean) => {
                return this.updateActivationPendingStatus(userId, true)
            });
    }

    public generateUserToken(userId: string, email: string, firstname: string, lastname: string): Promise<string> {
        // console.log("generate user token", email, firstname, lastname)
        return this.encodingService.encode({ user_id: userId, email: email, firstname: firstname, lastname: lastname })
    }

    public createUser(email: string, firstname: string, lastname: string, isSignUp?: boolean): Promise<User> {
        let newUser = {
            "connection": "Username-Password-Authentication",
            "email": email,
            "name": `${firstname} ${lastname}`,
            "password": `${UUID.UUID()}-${UUID.UUID().toUpperCase()}`,
            "email_verified": !isSignUp || true,
            "verify_email": false, // we are always sending our emails (not through Auth0)
            "app_metadata":
            {
                "activation_pending": true,
                "invitation_sent": false
            },
            "user_metadata":
            {
                "given_name": firstname,
                "family_name": lastname
            }
        }

        return this.lock.getApiToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.post("https://circlemapping.auth0.com/api/v2/users", newUser, { headers: headers })
                .map((responseData) => {
                    return responseData.json();
                })
                .map((input: any) => {
                    return User.create().deserialize(input);
                })
                .toPromise()
        });
    }

    public isActivationPending(user_id: string): Promise<boolean> {
        return this.lock.getApiToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.get("https://circlemapping.auth0.com/api/v2/users/" + user_id, { headers: headers })
                .map((responseData) => {
                    if (responseData.json().app_metadata) {
                        return responseData.json().app_metadata.activation_pending;
                    }
                    return false;
                })
                .toPromise()
        });
    }

    public isInvitationSent(user_id: string): Promise<boolean> {
        // console.log("is invitation sent for", user_id)
        return this.lock.getApiToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.get("https://circlemapping.auth0.com/api/v2/users/" + user_id, { headers: headers })
                .map((responseData) => {
                    if (responseData.json().app_metadata) {
                        // console.log("invite sent", responseData.json().app_metadata.invitation_sent)
                        return responseData.json().app_metadata.invitation_sent;
                    }
                    return false;
                })
                .toPromise()
        });
    }

    public updateUserInformation(user_id: string, password: string, firstname: string, lastname: string): Promise<boolean> {
        return this.lock.getApiToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.patch("https://circlemapping.auth0.com/api/v2/users/" + user_id,
                {
                    "password": password,
                    "user_metadata":
                    {
                        "given_name": firstname,
                        "family_name": lastname
                    },
                    "connection": "Username-Password-Authentication"
                }
                ,
                { headers: headers })
                .toPromise()
                .then((response) => {
                    return true
                })
        });
    }

    public updateActivationPendingStatus(user_id: string, isActivationPending: boolean): Promise<boolean> {
        return this.lock.getApiToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.patch("https://circlemapping.auth0.com/api/v2/users/" + user_id,
                { "app_metadata": { "activation_pending": isActivationPending } }
                ,
                { headers: headers })
                .toPromise()
                .then((response) => {
                    return true
                })
        });
    }

    public updateInvitiationSentStatus(user_id: string, isInvitationSent: boolean): Promise<boolean> {
        return this.lock.getApiToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.patch("https://circlemapping.auth0.com/api/v2/users/" + user_id,
                { "app_metadata": { "invitation_sent": isInvitationSent } }
                ,
                { headers: headers })
                .map((responseData) => {
                    return true;
                })
                .toPromise()
                .then(r => r)
                .catch(this.errorService.handleError);
        });
    }

    public storeProfile(user_id: string): Promise<void> {
        return this.lock.getApiToken().then((token: string) => {
            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);
            return this.http.get("https://circlemapping.auth0.com/api/v2/users/" + user_id,
                { headers: headers })
                .map((responseData) => {
                    localStorage.setItem("profile", JSON.stringify(responseData.json()));
                })
                .toPromise()
                .then(r => r)
                .catch(this.errorService.handleError);
        });
    }

    public changePassword(email: string): void {
        this.lock.getWebAuth().changePassword({
            connection: "Username-Password-Authentication",
            email: email
        }, function (err, resp) {
            if (err) {
                EmitterService.get("changePasswordFeedbackMessage").emit(err.error)
            } else {
                EmitterService.get("changePasswordFeedbackMessage").emit(resp)
            }
        });
    }

    public isUserExist(email: string): Promise<boolean> {
        return this.lock.getApiToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.get("https://circlemapping.auth0.com/api/v2/users?include_totals=true&q=" + encodeURIComponent(`email="${email}"`), { headers: headers })
                .map((responseData) => {
                    if (responseData.json().total) {
                        return responseData.json().total === 1
                    }
                    return false;
                })
                .toPromise()
        });
    }

    public getUserInfo(userId: string): Promise<User> {
        return this.lock.getApiToken().then((token: string) => {

            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);

            return this.http.get("https://circlemapping.auth0.com/api/v2/users/" + userId, { headers: headers })
                .map((responseData) => {
                    return responseData.json();
                })
                .map((input: any) => {
                    return User.create().deserialize(input);
                })
                .toPromise()
        });
    }

}