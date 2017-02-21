// app/auth.service.ts

import { Injectable } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";

// Avoid name not found warnings
declare var Auth0Lock: any;

@Injectable()
export class Auth {
  // Configure Auth0
  lock = new Auth0Lock("CRvF82hID2lNIMK4ei2wDz20LH7S5BMy", "circlemapping.auth0.com", {});
  userProfile: Object;

  constructor() {
    // Set userProfile attribute of already saved profile
    this.userProfile = JSON.parse(localStorage.getItem("profile"));

    // Add callback for the Lock `authenticated` event
    this.lock.on("authenticated", (authResult:any) => {
      localStorage.setItem("id_token", authResult.idToken);

      // Fetch profile information
      this.lock.getProfile(authResult.idToken, (error:any, profile:any) => {
        if (error) {
          // Handle error
          alert(error);
          return;
        }

        localStorage.setItem("profile", JSON.stringify(profile));
        this.userProfile = profile;
      });
    });
  }

  public login() {
    // Call the show method to display the widget.
    this.lock.show();
  }

public authenticated() {
    // Check if there's an unexpired JWT
    // This searches for an item in localStorage with key == 'id_token'
    return tokenNotExpired();
  }

 public logout() {
    // Remove token and profile from localStorage
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    this.userProfile = undefined;
  }

}