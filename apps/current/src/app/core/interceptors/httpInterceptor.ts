
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {catchError} from 'rxjs/operators';
import { Http, Request, RequestOptions, RequestOptionsArgs, Response, XHRBackend } from "@angular/http"
import { Injectable, ErrorHandler, NgModule } from "@angular/core"
import "rxjs/add/operator/catch"
import "rxjs/add/observable/throw"
import "rxjs/add/operator/map";
import { Router } from "@angular/router";


export class HttpLogInterceptor extends Http {

    constructor(
        backend: XHRBackend,
        options: RequestOptions,
        private errorHandler: ErrorHandler,
        private router: Router
    ) {
        super(backend, options)
    }

    public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return super.request(url, options).pipe(
            catchError(this.handleError))
    }

    private isUnauthorized(status: number): boolean { 
        return status === 0 || status === 401;
    }

    public handleError = (error: Response) => {
        if (this.isUnauthorized(error.status)) {
            this.router.navigateByUrl("/logout");
        }
        this.errorHandler.handleError(error);
        return observableThrowError(error)
    }

}


export function httpFactory(backend: XHRBackend, options: RequestOptions, errorHandler: ErrorHandler, router: Router) {
    return new HttpLogInterceptor(backend, options, errorHandler, router);
}

@NgModule({
    providers: [
        {
            provide: Http,
            useFactory: httpFactory,
            deps: [XHRBackend, RequestOptions, ErrorHandler, Router]
        }
    ]
})
export class HttpFactoryModule { };