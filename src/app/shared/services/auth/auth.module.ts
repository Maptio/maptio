import { Router } from "@angular/router";
import { NgModule } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { AuthHttpInterceptor } from "../../../core/interceptors/authHttpInterceptor";
import { Auth } from "../../../core/authentication/auth.service";



export function authHttpServiceFactory(http: Http, options: RequestOptions, auth: Auth, router: Router) {

  let config = new AuthConfig({
    tokenName: "maptio_api_token",
    tokenGetter: (() => { return localStorage.getItem("maptio_api_token") }),
    globalHeaders: [{ "Content-Type": "application/json" }],
  })
  return new AuthHttpInterceptor(config, http, options, auth, router);
}

@NgModule({
  providers: [
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions, Auth, Router]
    }
  ]
})
export class AuthModule {
}