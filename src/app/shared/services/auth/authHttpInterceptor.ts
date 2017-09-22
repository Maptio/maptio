import { RequestOptions, Response, Request, RequestOptionsArgs, Headers, Http } from "@angular/http";
import { Observable } from "rxjs";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { Auth } from "./auth.service";


export class AuthHttpInterceptor extends AuthHttp {

    constructor(config: AuthConfig, http: Http, defaultOptions: RequestOptions, private authService: Auth) {
        super(config, http, defaultOptions)
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
        options.headers.append("Content-Type", "application/json");
        return options;
    }

    private isUnauthorized(status: number): boolean {
        return status === 0 || status === 401 || status === 403;
    }

    intercept(observable: Observable<Response>): Observable<Response> {

        return observable.catch((err, source) => {
            if (this.isUnauthorized(err.status)) {
                // logout the user or do what you want
                this.authService.logout();

                if (err instanceof Response) {
                    return Observable.throw(err.json().message || "backend server error");
                }
                return Observable.empty();
            } else {
                return Observable.throw(err);
            }
        });
    }
}