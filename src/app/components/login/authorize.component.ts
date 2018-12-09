import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { URIService } from '../../shared/services/uri.service';
import { JwtHelper } from 'angular2-jwt';
import { AuthConfiguration } from '../../shared/services/auth/auth.config';
import { Auth } from '../../shared/services/auth/auth.service';
import { UserFactory } from '../../shared/services/user.factory';
import { User } from '../../shared/model/user.data';
import { UserRole } from '../../shared/model/permission.data';
import { UserService } from '../../shared/services/user/user.service';
import { LoaderService } from '../../shared/services/loading/loader.service';
import { Intercom } from 'ng-intercom';
import { environment } from '../../../environment/environment';
import { Fullstory } from 'ngx-fullstory';
import { Angulartics2Mixpanel } from 'angulartics2';
import * as LogRocket from "logrocket";

@Component({
    selector: 'authorize',
    template: ''
})
export class AuthorizeComponent implements OnInit {

    subscription: Subscription;
    constructor(private route: ActivatedRoute, private router: Router,
        private userFactory: UserFactory, private userService: UserService,
        private uriService: URIService, private auth: Auth,
        private intercom: Intercom, public fullstory: Fullstory, private analytics: Angulartics2Mixpanel,
        private authConfig: AuthConfiguration, private loader: LoaderService) { }

    ngOnInit(): void {
        this.loader.show();
        this.subscription = this.route.fragment
            .map(fragment => this.uriService.parseFragment(fragment).get("id_token"))
            .map(token => new JwtHelper().decodeToken(token))
            .map((profile: string) => {
                localStorage.setItem("profile", JSON.stringify(profile));
                return profile;
            })
            .flatMap(() => {
                this.loader.show();
                return Observable.fromPromise(this.auth.loginMaptioApiSSO());
            })
            .map((tokens: { accessToken: string, idToken: string }) => {
                localStorage.setItem("maptio_api_token", tokens.accessToken);
                localStorage.setItem("id_token", tokens.idToken);
            })
            .flatMap(() => {
                this.loader.show();
                return Observable.fromPromise(this.authConfig.getAccessToken())
            })
            .map(accessToken => {
                localStorage.setItem("access_token", accessToken);
            })
            .flatMap(() => {
                this.loader.show();
                let profile = JSON.parse(localStorage.getItem("profile"));
                return this.upsertUser(profile)
            })
            .flatMap(() => {
                this.loader.show();
                let profile = JSON.parse(localStorage.getItem("profile"));
                return this.updateMetadata(profile)
            })
            .do((user: User) => {
                this.intercom.update({
                    app_id: environment.INTERCOM_APP_ID,
                    email: user.email,
                    user_id: user.user_id,
                    name: user.name,
                    is_invited: user.isInvitationSent
                });
            })
            .do((user: User) => {
                this.analytics.setSuperProperties({
                    user_id: user.user_id,
                    email: user.email
                });
                this.analytics.eventTrack("Login", {
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname
                });
            })
            .do((user: User) => {
                this.fullstory.login(user.user_id, {
                    displayName: user.name,
                    email: user.email
                });
            })
            .do((user: User) => {
                LogRocket.identify(user.user_id, {
                    name: user.name,
                    email: user.email,
                });
            })
            .subscribe((user: User) => {
                this.loader.hide();
                this.router.navigateByUrl("/home");
            }, (err) => {
                if (err.error === "login_required") {
                    this.router.navigateByUrl(`/login?login_message=Cannot log you in with Google. It looks like the problem is your ad-blocker. Try adding app.maptio.com to your whitelist then refreshing the page.`);
                }
                else {
                    console.error(err);
                    this.router.navigateByUrl(`/login?login_message=${err}`);
                }

                this.loader.hide();
            })
    }

    private upsertUser(profile: any): Observable<User> {

        let user = User.create().deserialize(profile);

        return Observable.fromPromise(this.userFactory.getUsers([user.user_id]).then(users => { return users }))
            .map((users: User[]) => {
                return users;
            })
            .flatMap((users: User[]) => {
                if (users.length === 0) {
                    // this user wasnt in the database before (i.e. not invited) so they are a founder and should have admin rights
                    user.userRole = UserRole.Admin;
                    return Observable.fromPromise(this.userFactory.create(user))
                }
                else {
                    return Observable.of(users[0])
                }
            })
            .map(u => {
                return Observable.from(this.userService.updateUserRole(user.user_id, UserRole[user.userRole]))
            })
            .map(() => {
                return Observable.fromPromise(this.userService.updateActivationPendingStatus(user.user_id, false))
            })
            .map(() => {
                return Observable.fromPromise(this.userService.getUsersInfo([user]))
            })
            .map(users => users[0])

    }

    private updateMetadata(profile: any): Observable<User> {
        let picture: string, firstName: string, lastName: string;

        let user = User.create().deserialize(profile);

        let userId = user.user_id;
        let identities = profile.identities.length;
        let googleIdentity = profile.identities.find((i: any) => i.provider === "google-oauth2");

        if (googleIdentity) {
            if (identities === 1) {
                picture = profile.picture;
                firstName = profile.given_name;
                lastName = profile.family_name;
            }
            else {
                picture = googleIdentity.profileData.picture;
                firstName = googleIdentity.profileData.given_name;
                lastName = googleIdentity.profileData.family_name;
            }
        } else {
            picture = googleIdentity.profileData.picture;
            firstName = googleIdentity.profileData.given_name;
            lastName = googleIdentity.profileData.family_name;
        }

        return Observable
            .forkJoin(
                this.userService.updateUserPictureUrl(userId, picture),
                this.userService.updateUserProfile(userId, firstName, lastName))
            .switchMap(() => {
                return Observable.fromPromise(this.userService.getUsersInfo([user]))
            })
            .map(users => users[0])

    }
}
