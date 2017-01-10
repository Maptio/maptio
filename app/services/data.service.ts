import { Injectable, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { ErrorService } from './error.service'

@Injectable()
export class DataService {

    private http: Http;
    private _data$: Subject<any>;

    constructor(http: Http, public errorService: ErrorService) {
        this._data$ = new Subject();
        this.http = http;
    }

    setAsync(data: any): void {
        this._data$.next(data);
    }

    getAsync(): Observable<any> {
        return this._data$.asObservable();
    }

    loadFromAsync(url: string): Promise<any> {
        return this.http.get(url)
            .toPromise()
            .then(response => response.json())
            .catch(this.errorService.handleError);
    }
}
