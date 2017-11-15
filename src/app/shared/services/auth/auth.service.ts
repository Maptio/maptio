import { Angulartics2Mixpanel } from "angulartics2";
import { environment } from "./../../../../environment/environment";
import { LoaderService } from "./../loading/loader.service";
import { Observable } from "rxjs/Rx";
import { Router } from "@angular/router";
import { Http, Headers } from "@angular/http";
import { Subject } from "rxjs/Rx";
import { Injectable } from "@angular/core";
import { AuthConfiguration } from "./auth.config";
import { DatasetFactory } from "../dataset.factory";
import { UserFactory } from "../user.factory";
import { User } from "../../model/user.data";
import { EmitterService } from "../emitter.service";
import { tokenNotExpired } from "angular2-jwt/angular2-jwt";
import { uniq } from "lodash";

@Injectable()
export class Auth {

    private MAPTIO_INTERNAL_EMAILS =
    [
        "safiyya.babio@gmail.com",
        "hello@tomnixon.co.uk",
        "karlparton@gmail.com",
        "lisa@reimaginaire.com",
        "hellochandnipatel@gmail.com"
    ]

    private user$: Subject<User> = new Subject();

    constructor(
        private http: Http, private configuration: AuthConfiguration, private datasetFactory: DatasetFactory,
        private userFactory: UserFactory, private router: Router, private loader: LoaderService, private analytics: Angulartics2Mixpanel
    ) {
    }

    public logout(): void {
        this.analytics.eventTrack("Logout", {});
        // this.shutDownIntercom();
        localStorage.clear();
        this.router.navigate(["home"]);
    }

    // public shutDownIntercom() {
    //     (<any>window).Intercom("shutdown");
    // }

    /**
         * Checks if Auth0 Management API is still valid
         */
    public authenticationProviderAuthenticated() {
        return tokenNotExpired("access_token");
    }

    /**
     * Checks if Maptio API is still valid
     */
    public internalApiAuthenticated() {
        return tokenNotExpired("maptio_api_token");
    }

    /**
     * Checks is ID token is still valid
     */
    public authenticated(): boolean {
        return tokenNotExpired("id_token");
    }

    public allAuthenticated() {
        return this.authenticated() && this.internalApiAuthenticated() && this.authenticationProviderAuthenticated()
    }

    public loginMaptioApi(email: string, password: string) {
        if (!email || !password) return;

        this.configuration.getWebAuth().client.login({
            realm: environment.CONNECTION_NAME,
            username: email,
            password: password,
            scope: "openid profile api invite",
            audience: environment.MAPTIO_API_URL
        }, function (err: any, authResult: any) {
            if (authResult.accessToken) {
                EmitterService.get("maptio_api_token").emit(authResult.accessToken)
            }
        })
    }

    public getUserInfo(userId: string): Promise<User> {
        return this.configuration.getAccessToken().then((token: string) => {

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

    public getUser(): Observable<User> {
        let profileString = localStorage.getItem("profile");

        if (profileString) {
            Promise.all([
                this.getUserInfo(JSON.parse(profileString).user_id),
                this.userFactory.get(JSON.parse(profileString).user_id)])
                .then(([auth0User, databaseUser]: [User, User]) => {
                    let user = auth0User;
                    user.teams = uniq(databaseUser.teams); // HACK : where does the duplication comes from?
                    user.shortid = databaseUser.shortid;
                    return user
                })
                .then((user: User) => {
                    this.datasetFactory.get(user).then(ds => {
                        user.datasets = uniq(ds);
                        this.user$.next(user)
                    })
                });
        }
        else {
            this.user$.next(undefined);
        }
        return this.user$.asObservable();
    }

    public setUser(profile: any): Promise<boolean> {

        localStorage.setItem("profile", JSON.stringify(profile));

        return this.userFactory.get(profile.user_id)
            .then((user) => {
                // console.log("getting user", user)
                this.user$.next(user);
                return Promise.resolve<boolean>(true);
            })
            .catch((reason: any) => {

                let user = User.create().deserialize(profile);
                this.userFactory.create(user)
                    .then(() => { return Promise.resolve<boolean>(true); })
                    .catch(() => { return Promise.resolve<boolean>(false); });  // adds the user in the database
                this.user$.next(user);
                return Promise.resolve<boolean>(true);

            });
    }

    public addMinutes(date: Date, minutes: number) {
        return new Date(date.getTime() + minutes * 60000);
    }


    public login(email: string, password: string): Promise<boolean> {
        this.loader.show();
        try {
            this.configuration.getWebAuth().client.login({
                realm: environment.CONNECTION_NAME,
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

                if (authResult.accessToken) {
                    this.configuration.getWebAuth().client.userInfo(authResult.accessToken, function (err: Error, profile: any) {
                        profile.user_id = profile.sub;
                        profile.sub = undefined;

                        this.loginMaptioApi(email, password);

                        EmitterService.get("maptio_api_token").subscribe((token: string) => {
                            if (localStorage.getItem("maptio_api_token"))
                                localStorage.removeItem("maptio_api_token")
                            localStorage.setItem("maptio_api_token", token)

                            return this.setUser(profile).then((isSuccess: boolean) => {

                                if (isSuccess) {
                                    return this.userFactory.get(profile.user_id)
                                        .then((user: User) => {

                                            this.user$.next(user);
                                            return user;
                                        })
                                        .then((user: User) => {
                                            let isMaptioTeam = this.MAPTIO_INTERNAL_EMAILS.includes(user.email);
                                            
                                            this.analytics.setSuperProperties({
                                                user_id: user.user_id, email: user.email, isInternal: isMaptioTeam

                                            })
                                            this.analytics.eventTrack("Login", { email: user.email, firstname: user.firstname, lastname: user.lastname });

                                            // let isUserVIP = (user.email === "safiyya.babio@gmail.com" || user.email === "hello@tomnixon.co.uk");
                                            // (<any>window).Intercom("boot", {
                                            //     app_id: environment.INTERCOM_APP_ID,
                                            //     email: user.email,
                                            //     user_id: user.user_id,
                                            //     hide_default_launcher: !isUserVIP
                                            // });

                                            return user;
                                        }, () => { })
                                        .then((user: User) => {
                                            this.loader.hide()
                                            let redirectUrl = localStorage.getItem("redirectUrl");
                                            this.router.navigateByUrl(redirectUrl ? redirectUrl : "/home");
                                        })
                                }
                                else {
                                    this.errorService.handleError("Something has gone wrong ! Try again ?");
                                }
                            })
                        })


                    }.bind(this))
                }
            }.bind(this));

        } catch (error) {
            return Promise.reject(error)
        }
        finally {
            this.loader.hide()
        }



    }





}
