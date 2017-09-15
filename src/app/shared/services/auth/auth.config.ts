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

    constructor(private http: Http) {
        this._http = http;
    }

    public getWebAuth(): WebAuth {
        return new WebAuth({
            domain: "circlemapping.auth0.com",
            clientID: "CRvF82hID2lNIMK4ei2wDz20LH7S5BMy"
        });
    }

    public getLock(): any {
        let options = {
            closable: true,
            theme: {
                logo: "assets/images/logo.png",
                primaryColor: "#D76159"
            },
            languageDictionary: {
                title: ""
            },
            auth: {
                redirectUrl: location.origin,
                responseType: "token",
            }
        };

        if (!this._lock)
            this._lock = new Auth0Lock("CRvF82hID2lNIMK4ei2wDz20LH7S5BMy", "circlemapping.auth0.com", options);

        return this._lock;
    }

    getApiToken(): Promise<string> {

        let access_token = localStorage.getItem("access_token");
        if (access_token)
            return Promise.resolve(access_token);
        else
        return this._http.post(
            "https://circlemapping.auth0.com/oauth/token",
            {
                "client_id": "mjQumlN564UkegYxzZGLNhM0umeEsmdC",
                "client_secret": "YHMsevargwqFXmBt7I0rAjjkhCz_yQ6gb8-g4YLwQRvKI_B2at22r0MUmyENEXZ_",
                "audience": "https://circlemapping.auth0.com/api/v2/",
                "grant_type": "client_credentials"
            }).map((responseData) => {
                localStorage.setItem("access_token", responseData.json().access_token);
                return responseData.json().access_token;
            }).toPromise();



    }
}