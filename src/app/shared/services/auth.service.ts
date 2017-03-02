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
  private userProfile$: Subject<Object>;

  constructor(userFactory: UserFactory) {
    this.userProfile$ = new Subject();
    this.userProfile$.next(JSON.parse(localStorage.getItem("profile")));
    this.lock.on("authenticated", (authResult: any) => {
      localStorage.setItem("id_token", authResult.idToken);
      this.lock.getProfile(authResult.idToken, (error: any, profile: any) => {
        if (error) {
          alert(error);
          return;
        }

        localStorage.setItem("profile", JSON.stringify(profile));
        userFactory.upsert(User.create().deserialize(profile)); // adds the user in the database
        this.userProfile$.next(profile);
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
    this.userProfile$.next(undefined);
  }

  public getUser(): Observable<Object> {
    return this.userProfile$.asObservable();
  }

}