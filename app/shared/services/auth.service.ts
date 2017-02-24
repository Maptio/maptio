import { Injectable } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";

declare var Auth0Lock: any;

@Injectable()
export class Auth {

  lock = new Auth0Lock("CRvF82hID2lNIMK4ei2wDz20LH7S5BMy", "circlemapping.auth0.com", {});
  userProfile: Object;

  constructor() {
    this.userProfile = JSON.parse(localStorage.getItem("profile"));

    this.lock.on("authenticated", (authResult: any) => {
      localStorage.setItem("id_token", authResult.idToken);
      this.lock.getProfile(authResult.idToken, (error: any, profile: any) => {
        if (error) {
          alert(error);
          return;
        }

        localStorage.setItem("profile", JSON.stringify(profile));
        this.userProfile = profile;
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
    this.userProfile = undefined;
  }

  public getUser(): Object {
    return this.userProfile;
  }

}