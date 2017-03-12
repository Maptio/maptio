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

  // FIXME : credentials should come from configuration service
  private _lock = new Auth0Lock("CRvF82hID2lNIMK4ei2wDz20LH7S5BMy", "circlemapping.auth0.com", {});

  private user$: Subject<User>;

  /**
   * Store the URL so we can redirect after logging in
   */
  redirectUrl: string;

  constructor(public userFactory: UserFactory) {

    this.user$ = new Subject();
    this.getLock().on("authenticated", (authResult: any) => {
      localStorage.setItem("id_token", authResult.idToken);

      this.getLock().getProfile(authResult.idToken, (error: any, profile: any) => {
        if (error) {
          alert(error);
          return;
        }
        this.setUser(profile);
      });
    });
  }

  public setUser(profile: any) {
    localStorage.setItem("profile", JSON.stringify(profile));

    this.userFactory.get(profile.user_id)
      .then((user) => {
        this.user$.next(user)
      }).
      catch((reason: any) => {
        let user = User.create().deserialize(profile);
        this.userFactory.upsert(user)//.then(() => { }).catch(() => { });  // adds the user in the database
        this.user$.next(user);
      });
  }

  public getLock() {
    return this._lock;
  }


  public login() {
    this.getLock().show();
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
    let profileString = localStorage.getItem("profile");

    if (profileString) {
      this.userFactory.get(JSON.parse(profileString).user_id).then((user) => {
        this.user$.next(user)
      });
    }
    else {
      this.clear();
    }
    return this.user$.asObservable();
  }

}