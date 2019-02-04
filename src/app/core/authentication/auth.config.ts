import { environment } from "../../config/environment";
import { Http } from "@angular/http";
import { WebAuth } from "auth0-js";
import { Injectable } from "@angular/core";

// declare var Auth0Lock: any;

@Injectable()
export class AuthConfiguration {

    public AUTH0_MANAGEMENTAPI_KEY = environment.AUTH0_MANAGEMENTAPI_KEY;
    public AUTH0_MANAGEMENTAPI_SECRET = environment.AUTH0_MANAGEMENTAPI_SECRET;
    public AUTH0_APP_KEY = environment.AUTH0_APP_KEY;
    public AUTH0_DOMAIN = environment.AUTH0_DOMAIN;

    constructor(private http: Http) {
    }

    public getWebAuth(): WebAuth {
        return new WebAuth({
            domain: this.AUTH0_DOMAIN,
            clientID: this.AUTH0_APP_KEY
        });
    }

    getAccessToken(): Promise<string> {

        let access_token = localStorage.getItem("access_token");
        if (access_token)
            return Promise.resolve(access_token);
        else
            return this.http.post(
                environment.ACCESS_TOKEN_URL,
                {
                    "client_id": this.AUTH0_MANAGEMENTAPI_KEY,
                    "client_secret": this.AUTH0_MANAGEMENTAPI_SECRET,
                    "audience": environment.ACCESS_TOKEN_AUDIENCE,
                    "grant_type": "client_credentials"
                }).map((responseData) => {
                    localStorage.setItem("access_token", responseData.json().access_token);
                    return responseData.json().access_token;
                }).toPromise();
    }
}