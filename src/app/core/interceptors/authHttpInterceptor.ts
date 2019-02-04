import { Observable } from "rxjs/Rx";
import { Router } from "@angular/router";
import { RequestOptions, Response, Request, RequestOptionsArgs, Headers, Http } from "@angular/http";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { Auth } from "../authentication/auth.service";


export class AuthHttpInterceptor extends AuthHttp {

    private _config: AuthConfig;

    constructor(config: AuthConfig, http: Http, defaultOptions: RequestOptions, private authService: Auth, private router: Router) {

        super(config, http, defaultOptions);
        this._config = config;
    }

    // Just for testing (:/)
    getConfig() {
        return this._config;
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.request(url, options));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.get(url, options));
    }

    post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
    }

    put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.delete(url, options));
    }

    private getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        return options;
    }

    private isUnauthorized(status: number): boolean {
        return status === 0 || status === 401 || status === 403;
    }

    private isJWTExpired(message: string): boolean {
        return message === "No JWT present or has expired";
    }


    intercept(observable: Observable<Response>): Observable<Response> {
        return observable.catch((err, source) => {
            console.error(err);
            if (this.isUnauthorized(err.status)) {
                this.router.navigateByUrl("/unauthorized");

                if (err instanceof Response) {
                    return Observable.throw(err.json().message || "backend server error");
                }
                return Observable.empty();
            }
            else if (this.isJWTExpired(err.message)) {
                this.router.navigateByUrl("login?login_message=Your session expired, please log back in.");
                return Observable.empty();
            }
            else {
                return Observable.throw(err);
            }
        });
    }
}