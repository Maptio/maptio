import { MailingService } from './../mailing/mailing.service';
import { JwtEncoder } from './../encoding/jwt.service';
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

    constructor(private http: Http, public lock: AuthConfiguration,
        public userFactory: UserFactory, private router: Router, private errorService: ErrorService,
        public encodingService: JwtEncoder, public mailing: MailingService) {
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
        console.log("setUser", profile)
        localStorage.setItem("profile", JSON.stringify(profile));

        return this.userFactory.get(profile.user_id)
            .then((user) => {
                console.log("getting user", user)
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

    public authenticated(): boolean {
        return tokenNotExpired();
    }

    public logout(): void {
        localStorage.clear();
        this.clear();
    }

    public isEmailVerified(userId: string): Promise<boolean> {
        console.log("isEmailVerified")
        return this.getApiToken().then((token: string) => {
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
        console.log("isFIrstLogin")
        return this.getApiToken().then((token: string) => {
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

    public sendConfirmationEmail(userId: string): Promise<boolean> {
        console.log("sendConfirmationEmail")
        return this.getApiToken().then((token: string) => {
            let headers = new Headers();
            headers.set("Authorization", "Bearer " + token);
            return this.http.post(
                "https://circlemapping.auth0.com/api/v2/jobs/verification-email",
                {
                    "user_id": userId
                },
                { headers: headers })
                .map((responseData) => {
                    return true;
                })
                .toPromise()
                .then(r => r)
                .catch(() => { return false });
        });
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


    public sendInvite(email: string, userId: string, name: string, teamName: string): Promise<boolean> {

        return Promise.all([
            this.encodingService.encode({ user_id: userId, email: email }),
            this.getApiToken()]
        ).then(([userToken, apiToken]: [string, string]) => {
            let headers = new Headers();
            headers.set("Authorization", "Bearer " + apiToken);
            return this.http.post(
                "https://circlemapping.auth0.com/api/v2/tickets/email-verification",
                {
                    "result_url": "http://app.maptio.com/home/" + userToken,
                    "user_id": userId
                },
                { headers: headers })
                .map((responseData) => {
                    return <string>responseData.json().ticket;
                }).toPromise()
        })
            .then((ticket: string) => {
                return this.mailing.sendInvitation("support@maptio.com", ["safiyya.babio@gmail.com"], "You've been invited in Maptio", ticket, teamName)
            })
    }

    public createUser(email: string, name: string): Promise<User> {
        let newUser = {
            "connection": "Username-Password-Authentication",
            "email": email,
            "name": name,
            "password": UUID.UUID(),
            "email_verified": true,
            "verify_email": false
        }

        return this.getApiToken().then((token: string) => {

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
                .then(r => r)
                .catch(this.errorService.handleError);
        });
    }

}