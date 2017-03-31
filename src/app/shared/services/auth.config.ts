import { Injectable } from "@angular/core";

declare var Auth0Lock: any;

// FIXME : credentials should come from configuration service
@Injectable()
export class AuthConfiguration {

    private _lock: any;

    constructor() { }
    public getLock(): any {
        console.log("getting lock")
        let options = {
            closable: true,
            theme: {
                logo: "assets/images/logo.png",
                primaryColor: "#b81b1c"
            },
            languageDictionary: {
                title: "Maptio"
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