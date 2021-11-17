import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  forkJoin as observableForkJoin,
  of as observableOf,
  from as observableFrom,
  Subscription,
  Observable
} from 'rxjs';
import { switchMap, tap, mergeMap, map } from 'rxjs/operators';

import { JwtHelperService } from "@auth0/angular-jwt";

import { Intercom } from 'ng-intercom';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import * as LogRocket from "logrocket";

import { URIService } from '../../../../shared/services/uri/uri.service';
import { AuthConfiguration } from '../../../../core/authentication/auth.config';
import { Auth } from '../../../../core/authentication/auth.service';
import { UserFactory } from '../../../../core/http/user/user.factory';
import { User } from '../../../../shared/model/user.data';
import { UserRole } from '../../../../shared/model/permission.data';
import { UserService } from '../../../../shared/services/user/user.service';
import { LoaderService } from '../../../../shared/components/loading/loader.service';
import { environment } from '../../../../config/environment';


@Component({
    selector: 'authorize',
    template: ''
})
export class AuthorizeComponent implements OnInit {
    fullstory: any = window["FS"];
    subscription: Subscription;
    jwtHelper = new JwtHelperService();

    constructor(private route: ActivatedRoute, private router: Router,
        private userFactory: UserFactory, private userService: UserService,
        private uriService: URIService, private auth: Auth,
        private intercom: Intercom, private analytics: Angulartics2Mixpanel,
        private authConfig: AuthConfiguration, private loader: LoaderService
    ) {}

    ngOnInit(): void {
        this.loader.show();
        this.subscription = this.route.fragment.pipe(
            map(fragment => this.uriService.parseFragment(fragment).get("id_token")),
            map(token => this.jwtHelper.decodeToken(token)),
            map((profile: string) => {
                localStorage.setItem("profile", JSON.stringify(profile));
                return profile;
            }),
            mergeMap(() => {
                this.loader.show();
                return observableFrom(this.auth.loginMaptioApiSSO());
            }),
            map((tokens: { accessToken: string, idToken: string }) => {
                localStorage.setItem("maptio_api_token", tokens.accessToken);
                localStorage.setItem("id_token", tokens.idToken);
            }),
            mergeMap(() => {
                this.loader.show();
                return observableFrom(this.authConfig.getAccessToken())
            }),
            map(accessToken => {
                localStorage.setItem("access_token", accessToken);
            }),
            mergeMap(() => {
                this.loader.show();
                let profile = JSON.parse(localStorage.getItem("profile"));
                return this.upsertUser(profile)
            }),
            mergeMap(() => {
                this.loader.show();
                let profile = JSON.parse(localStorage.getItem("profile"));
                return this.updateMetadata(profile)
            }),
            tap((user: User) => {
                this.intercom.update({
                    app_id: environment.INTERCOM_APP_ID,
                    email: user.email,
                    user_id: user.user_id,
                    name: user.name,
                    avatar: {
                        type: "avatar",
                        image_url: user.picture,
                    },
                    is_invited: user.isInvitationSent
                });
            }),
            tap((user: User) => {
                this.analytics.setSuperProperties({
                    user_id: user.user_id,
                    email: user.email
                });
                this.analytics.eventTrack("Login", {
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname
                });
            }),
            tap((user: User) => {
                this.fullstory.identify(user.user_id, {
                    displayName: user.name,
                    email: user.email
                });
            }),
            tap((user: User) => {
                LogRocket.identify(user.user_id, {
                    name: user.name,
                    email: user.email,
                });
            }),)
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

        return observableFrom(this.userFactory.getUsers([user.user_id]).then(users => { return users })).pipe(
            map((users: User[]) => {
                return users;
            }),
            mergeMap((users: User[]) => {
                if (users.length === 0) {
                    // this user wasnt in the database before (i.e. not invited) so they are a founder and should have admin rights
                    user.userRole = UserRole.Admin;
                    return observableFrom(this.userFactory.create(user))
                }
                else {
                    return observableOf(users[0])
                }
            }),
            map(u => {
                return observableFrom(this.userService.updateUserRole(user.user_id, UserRole[user.userRole]))
            }),
            map(() => {
                return observableFrom(this.userService.updateActivationPendingStatus(user.user_id, false))
            }),
            map(() => {
                return observableFrom(this.userService.getUsersInfo([user]))
            }),
            map(users => users[0]),)

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

        return observableForkJoin(
                this.userService.updateUserPictureUrl(userId, picture),
                this.userService.updateUserProfilePlaceholder(userId, firstName, lastName)).pipe(
            switchMap(() => {
                return observableFrom(this.userService.getUsersInfo([user]))
            }),
            map(users => users[0]),)

    }
}
