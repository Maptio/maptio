import { LoaderService } from './loader.service';
// import { LoaderService } from "./loader.service";
// import { Injectable } from "@angular/core";
// import { Observable } from "rxjs/Observable";
// import "rxjs/Rx";
// import {
//     Http,
//     RequestOptions,
//     RequestOptionsArgs,
//     Response,
//     Request,
//     Headers,
//     XHRBackend
// } from "@angular/http";


// @Injectable()
// export class HttpService extends Http {

//     constructor(
//         backend: XHRBackend,
//         defaultOptions: RequestOptions,
//         public loaderService: LoaderService
//     ) {
//         super(backend, defaultOptions);
//         console.log(loaderService.loaderState)
//     }

//     get(url: string, options?: RequestOptionsArgs): Observable<any> {

//         this.showLoader();

//         return super.get(url, this.requestOptions(options))
//             .catch(this.onCatch)
//             .do((res: Response) => {
//                 this.onSuccess(res);
//             }, (error: any) => {
//                 this.onError(error);
//             })
//             .finally(() => {
//                 this.onEnd();
//             });

//     }

//     private requestOptions(options?: RequestOptionsArgs): RequestOptionsArgs {
//         if (options == null) {
//             options = new RequestOptions();
//         }
//         if (options.headers == null) {
//             options.headers = new Headers();
//         }

//         return options;
//     }

//     private onCatch(error: any, caught: Observable<any>): Observable<any> {
//         return Observable.throw(error);
//     }

//     private onSuccess(res: Response): void {
//         console.log("Request successful");
//     }

//     private onError(res: Response): void {
//         console.log("Error, status code: " + res.status);
//     }

//     private onEnd(): void {
//         this.hideLoader();
//     }

//     private showLoader(): void {
//         console.log("show")
//         this.loaderService.show();
//     }

//     private hideLoader(): void {
//         console.log("hide")
//         this.loaderService.hide();
//     }
// }


import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/do";
import "rxjs/add/operator/finally";
import { Http, XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Headers } from "@angular/http";
declare var $: any;

@Injectable()
export class HttpService extends Http {
    public pendingRequests: number = 0;
    // public showLoading: boolean = false;

    constructor(backend: XHRBackend, defaultOptions: RequestOptions, private loader: LoaderService) {
        super(backend, defaultOptions);
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.request(url, options));
    }

    intercept(observable: Observable<Response>): Observable<Response> {
        console.log("In the intercept routine..");
        this.pendingRequests++;
        this.turnOnModal();
        return observable
            .catch((err: any, source: Observable<Response>) => {
                console.log("Caught error: " + err);
                return source;
            })
            .do((res: Response) => {
                console.log("Response: " + res);
            }, (err: any) => {
                console.log("Caught error: " + err);
            })
            .finally(() => {
                console.log("Finally.. delaying, though.")
                let timer = Observable.timer(1000);
                timer.subscribe(t => {
                    this.turnOffModal();
                });
            });
    }

    private turnOnModal() {
        this.loader.show();
        // if (!this.showLoading) {
        //     this.showLoading = true;
        //     $("body").spin("modal", "#FFFFFF", "rgba(51, 51, 51, 0.1)");
        //     console.log("Turned on modal");
        // }
        // this.showLoading = true;
    }

    private turnOffModal() {
        this.pendingRequests--;
        if (this.pendingRequests <= 0) {
            this.loader.hide();
            // if (this.showLoading) {
            //     $("body").spin("modal", "#FFFFFF", "rgba(51, 51, 51, 0.1)");
            // }
            // this.showLoading = false;
        }
        console.log("Turned off modal");
    }
}


