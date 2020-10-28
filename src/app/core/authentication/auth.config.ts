import { environment } from "../../config/environment";
import { Http, Response } from "@angular/http";
import { WebAuth } from "auth0-js";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators";

// declare var Auth0Lock: any;

@Injectable()
export class AuthConfiguration {
  public AUTH0_APP_KEY = environment.AUTH0_APP_KEY;
  public AUTH0_DOMAIN = environment.AUTH0_DOMAIN;

  constructor(private http: Http) {}

  public getWebAuth(): WebAuth {
    return new WebAuth({
      domain: this.AUTH0_DOMAIN,
      clientID: this.AUTH0_APP_KEY
    });
  }

  getAccessToken(): Promise<string> {
    let access_token = window.localStorage.getItem("access_token");

    if (access_token) return Promise.resolve(access_token);
    else {
      return this.http.get("/api/v1/authentication/token").pipe(
        map((responseData) => {
          window.localStorage.setItem("access_token", responseData.text());
          return responseData.text();
        })
      )
      .toPromise();
    }
  }
}
