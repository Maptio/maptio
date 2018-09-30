import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { URIService } from '../../shared/services/uri.service';
import { JwtHelper } from 'angular2-jwt';
import { AuthConfiguration } from '../../shared/services/auth/auth.config';
import { Auth } from '../../shared/services/auth/auth.service';
import { UserFactory } from '../../shared/services/user.factory';
import { User } from '../../shared/model/user.data';
import { filter } from '../../../../node_modules/rxjs/operator/filter';
import { UserRole } from '../../shared/model/permission.data';
import { UserService } from '../../shared/services/user/user.service';
import { ConsoleReporter } from 'jasmine';
import { last } from '../../../../node_modules/rxjs/operator/last';

@Component({
    selector: 'authorize',
    template: ''
})
export class AuthorizeComponent implements OnInit {

    subscription: Subscription;
    constructor(private route: ActivatedRoute, private router: Router,
        private userFactory: UserFactory, private userService: UserService,
        private uriService: URIService, private auth: Auth,
        private authConfig: AuthConfiguration) { }

    ngOnInit(): void {
        this.subscription = this.route.fragment
            .map(fragment => this.uriService.parseFragment(fragment).get("id_token"))
            .map(token => new JwtHelper().decodeToken(token))
            .map((profile: string) => {
                localStorage.setItem("profile", JSON.stringify(profile));
                return profile;
            })
            .flatMap(() => {
                return Observable.fromPromise(this.auth.loginMaptioApiSSO());
            })
            .map((tokens: { accessToken: string, idToken: string }) => {
                localStorage.setItem("maptio_api_token", tokens.accessToken);
                localStorage.setItem("id_token", tokens.idToken);
            })
            .flatMap(() => {
                return Observable.fromPromise(this.authConfig.getAccessToken())
            })
            .map(accessToken => {
                localStorage.setItem("access_token", accessToken);
            })
            .flatMap(() => {
                let profile = JSON.parse(localStorage.getItem("profile"));
                return this.upsertUser(profile)
            })
            .flatMap(() => {
                let profile = JSON.parse(localStorage.getItem("profile"));
                return this.updateMetadata(profile)
            })
            .subscribe((user: User) => {
                this.router.navigateByUrl("/home");
            }, (err) => {
                console.log(err)
            })
    }

    private upsertUser(profile: any): Observable<User> {

        let user = User.create().deserialize(profile);

        return Observable.fromPromise(this.userFactory.getUsers([user.user_id]).then(users => { console.log("then", users); return users }))
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
        /* console.log("user", user);
  user.user_metadata = user.user_metadata || {};
  const identitiesNumber = user.identities.length;
  const googleIdentity = user.identities.find(i => i.provider === 'google-oauth2');
  if(googleIdentity){
    //google is only identity
      if(identitiesNumber===1){
        user.user_metadata.picture = user.picture;
        user.user_metadata.given_name = user.given_name;
        user.user_metadata.family_name = user.family_name;
      }
    else{
      user.user_metadata.picture = googleIdentity.profileData.picture;
      user.user_metadata.given_name = googleIdentity.profileData.given_name;
      user.user_metadata.family_name = googleIdentity.profileData.family_name;
    }
  }
  */


        let user = User.create().deserialize(profile);

        let userId = user.user_id;
        let identities = profile.identities.length;
        let googleIdentity = profile.identities.find((i: any) => i.provider === "google-oauth2");
        let picture: string, firstName: string, lastName: string;

        console.log(userId, identities, googleIdentity)
        if (googleIdentity) {
            if (identities === 1) {
                picture = profile.picture;
                firstName = profile.given_name;
                lastName = profile.family_name;
            }
            else{
                picture = googleIdentity.profileData.picture;
                firstName = googleIdentity.profileData.given_name;
                lastName = googleIdentity.profileData.family_name;
            }
        } else {
            picture = googleIdentity.profileData.picture;
            firstName = googleIdentity.profileData.given_name;
            lastName = googleIdentity.profileData.family_name;
        }

        console.log(picture, firstName, lastName)
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
