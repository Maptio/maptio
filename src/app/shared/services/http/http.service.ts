import { ErrorService } from "./../error/error.service";
import { LoaderService } from "./loader.service";
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

    // tslint:disable-next-line:whitespace
    constructor(backend: XHRBackend, defaultOptions: RequestOptions, private loader: LoaderService, private errorService: ErrorService) {
        super(backend, defaultOptions);
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        return this.intercept(super.request(url, options)) // .catch(this.handleError);
    }

    handleError(response: any) {

        // this.errorService.handleError(response.error);

        return Observable.throw(response.message);
    }

    intercept(observable: Observable<Response>): Observable<Response> {
        // console.log("In the intercept routine..");
        this.pendingRequests++;
        this.turnOnModal();
        return observable
            // .catch((err: any, source: Observable<Response>) => {
            //     Observable.throw(err);
            //     return source;
            // })
            // .do((res: Response) => {
            // }, (err: any) => {
            //     Observable.throw(err);
            // })
            .finally(() => {
                this.turnOffModal();
            });
    }

    private turnOnModal() {
        // this.loader.show();
    }

    private turnOffModal() {
        this.pendingRequests--;
        if (this.pendingRequests <= 0) {
            // this.loader.hide();
        }
    }
}


