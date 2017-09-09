import { WebAuth } from "auth0-js";
import { Injectable } from "@angular/core";

declare var Auth0Lock: any;

@Injectable()
export class AuthConfiguration {

    private _lock: any;
    private _webAuth: WebAuth;

    constructor() { }

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
}