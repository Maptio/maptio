import { NgModule, Injector } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { AuthHttpInterceptor } from "./authHttpInterceptor";
import { Auth } from "./auth.service";



export function authHttpServiceFactory(http: Http, options: RequestOptions, injector: Injector) {
  let auth = injector.get(Auth)
  let config = new AuthConfig({
    tokenName: "maptio_api_token",
    tokenGetter: (() => { console.log("getinng the token"); return localStorage.getItem("maptio_api_token") }),
    globalHeaders: [{ "Content-Type": "application/json" }],
  })
  return new AuthHttpInterceptor(config, http, options, auth);
}

@NgModule({
  providers: [
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions, Auth]
    }
  ]
})
export class AuthModule {
}