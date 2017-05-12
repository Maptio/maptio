import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { ErrorService } from "./error/error.service"

@Injectable()
export class DataService {

    private http: Http;
    private _data$: Subject<any>;

    constructor(http: Http, public errorService: ErrorService) {
        this._data$ = new Subject();
        this.http = http;
    }

    set(data: any): void {
        this._data$.next(data);
    }

    get(): Observable<any> {
        return this._data$.asObservable();
    }

    fetch(url: string): Promise<any> {
        return this.http.get(url)
            .toPromise()
            .then(response => response.json())
            .catch(this.errorService.handleError);
    }
}
