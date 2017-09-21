import { environment } from "./../../../../environment/environment";
import { Http } from "@angular/http";
import { WebAuth } from "auth0-js";
import { Injectable } from "@angular/core";

declare var Auth0Lock: any;

@Injectable()
export class AuthConfiguration {
    private _http: Http;

    private _lock: any;
    private _webAuth: WebAuth;
    private _apiToken: string;

    private AUTH0_MANAGEMENTAPI_KEY = environment.AUTH0_MANAGEMENTAPI_KEY;
    private AUTH0_MANAGEMENTAPI_SECRET = environment.AUTH0_MANAGEMENTAPI_SECRET;
    private AUTH0_APP_KEY = environment.AUTH0_APP_KEY;
    private AUTH0_DOMAIN = environment.AUTH0_DOMAIN;

    constructor(private http: Http) {
        this._http = http;
    }

    public getWebAuth(): WebAuth {
        return new WebAuth({
            domain: this.AUTH0_DOMAIN,
            clientID: this.AUTH0_APP_KEY
        });
    }

    getApiToken(): Promise<string> {

        let access_token = localStorage.getItem("access_token");
        if (access_token)
            return Promise.resolve(access_token);
        else
            return this._http.post(
                "https://circlemapping.auth0.com/oauth/token",
                {
                    "client_id": this.AUTH0_MANAGEMENTAPI_KEY,
                    "client_secret": this.AUTH0_MANAGEMENTAPI_SECRET,
                    "audience": "https://circlemapping.auth0.com/api/v2/",
                    "grant_type": "client_credentials"
                }).map((responseData) => {
                    localStorage.setItem("access_token", responseData.json().access_token);
                    return responseData.json().access_token;
                }).toPromise();



    }
}