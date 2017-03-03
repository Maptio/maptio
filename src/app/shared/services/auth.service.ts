import { UserFactory } from './user.factory';
import { Injectable } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { User } from "../model/user.data";

declare var Auth0Lock: any;

@Injectable()
export class Auth {

  lock = new Auth0Lock("CRvF82hID2lNIMK4ei2wDz20LH7S5BMy", "circlemapping.auth0.com", {});
  private user$: Subject<User>;

  constructor(public userFactory: UserFactory) {
    this.user$ = new Subject();
    this.lock.on("authenticated", (authResult: any) => {
      localStorage.setItem("id_token", authResult.idToken);
      this.lock.getProfile(authResult.idToken, (error: any, profile: any) => {
        if (error) {
          alert(error);
          return;
        }
        localStorage.setItem("profile", JSON.stringify(profile));
        userFactory.upsert(User.create().deserialize(profile));  // adds the user in the database
        userFactory.get(profile.user_id).then((user) => {
          this.user$.next(user)
        });
      });
    });
  }

  public login() {
    this.lock.show();
  }

  public authenticated() {
    return tokenNotExpired();
  }

  public logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("profile");
    this.clear();
  }

  public clear() {
    this.user$.next(undefined);
  }

  public getUser(): Observable<User> {
    return this.user$.asObservable();
  }

}