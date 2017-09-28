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



@Injectable()
export class Auth {

    private user$: Subject<User> = new Subject();

    constructor(
        private http: Http, private configuration: AuthConfiguration, private datasetFactory: DatasetFactory,
        private userFactory: UserFactory, private router: Router, private loader: LoaderService
    ) {
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
                this.userFactory.upsert(user)
                    .then(() => { return Promise.resolve<boolean>(true); })
                    .catch(() => { return Promise.resolve<boolean>(false); });  // adds the user in the database
                this.user$.next(user);
                return Promise.resolve<boolean>(true);

            });
    }

    public addMinutes(date: Date, minutes: number) {
        return new Date(date.getTime() + minutes * 60000);
    }

    public loginMaptioApi(email: string, password: string) {
        // let login = promisify(this.lock.getMaptioAuth().client.login, { multiArgs: true })

        this.configuration.getWebAuth().client.login({
            realm: "Username-Password-Authentication",
            username: email,
            password: password,
            scope: "openid profile api invite",
            audience: "https://app.maptio.com/api/v1"
        }, function (err: any, authResult: any) {
            if (authResult.accessToken) {
                EmitterService.get("maptio_api_token").emit(authResult.accessToken)
            }
        })
    }

    public login(email: string, password: string): Promise<boolean> {
        this.loader.show();
        try {
            this.configuration.getWebAuth().client.login({
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
        return tokenNotExpired();
    }

    public allAuthenticated() {
        return this.authenticated() && this.internalApiAuthenticated() && this.authenticationProviderAuthenticated()
    }

    public logout(): void {
        localStorage.clear();
        // this.clear();
        this.router.navigate(["home"]);
    }

    // public isEmailVerified(userId: string): Promise<boolean> {
    //     // console.log("isEmailVerified")
    //     return this.lock.getAuth0ManagementToken().then((token: string) => {
    //         let headers = new Headers();
    //         headers.set("Authorization", "Bearer " + token);
    //         return this.http.get("https://circlemapping.auth0.com/api/v2/users/" + userId, { headers: headers })
    //             .map((responseData) => {
    //                 return responseData.json().email_verified === "true";
    //             })
    //             .toPromise()
    //             .then(r => r)
    //             .catch(this.errorService.handleError);
    //     });
    // }

    // public isFirstLogin(userId: string): Promise<boolean> {
    //     // console.log("isFIrstLogin")
    //     return this.lock.getAuth0ManagementToken().then((token: string) => {
    //         let headers = new Headers();
    //         headers.set("Authorization", "Bearer " + token);
    //         return this.http.get("https://circlemapping.auth0.com/api/v2/users/" + userId, { headers: headers })
    //             .map((responseData) => {
    //                 return responseData.json().logins_count === 0;
    //             })
    //             .toPromise()
    //             .then(r => r)
    //             .catch(this.errorService.handleError);
    //     });
    // }


    public clear() {
        this.user$.next(undefined);
    }

    public getUser(): Observable<User> {
        let profileString = localStorage.getItem("profile");

        if (profileString) {

            Promise.all([
                this.getUserInfo(JSON.parse(profileString).user_id),
                this.userFactory.get(JSON.parse(profileString).user_id)])
                .then(([auth0User, databaseUser]: [User, User]) => {
                    let user = auth0User;
                    user.teams = databaseUser.teams;
                    user.shortid = databaseUser.shortid;
                    return user
                })
                .then((user: User) => {
                    this.datasetFactory.get(user).then(ds => {
                        // console.log(ds)
                        user.datasets = ds || [];
                        // console.log("auth.service.ts getUser", user)
                        this.user$.next(user)
                    })
                });
        }
        else {
            this.clear();
        }
        return this.user$.asObservable();
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

}