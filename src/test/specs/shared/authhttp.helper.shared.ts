import { encodeTestToken } from "angular2-jwt/angular2-jwt-test-helpers";
import { RequestOptions, Http } from "@angular/http";
import { AuthConfig } from "angular2-jwt";
import { AuthHttpInterceptor } from "../../../app/shared/services/auth/authHttpInterceptor";
import { Auth } from "../../../app/shared/services/auth/auth.service";

export function authHttpServiceFactoryTesting(http: Http, options: RequestOptions, authService: Auth) {
    let config = new AuthConfig({
        tokenGetter: (() => {
            return encodeTestToken({
                "exp": 9999999999
            })
        })
    })
    return new AuthHttpInterceptor(config, http, options, authService);
}