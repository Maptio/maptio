import {NgModule} from "@angular/core";
import {Http, RequestOptions} from "@angular/http";
import {AuthHttp} from "angular2-jwt";
import {AuthHttpInterceptor} from "./authHttpInterceptor";
import {Auth} from "./auth.service";

export function authHttpServiceFactory(http: Http, options: RequestOptions, authService: Auth) {
  return new AuthHttpInterceptor(http, options, authService);
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