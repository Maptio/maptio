import { Injectable, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject'

import 'rxjs/add/operator/map'

@Injectable()
export class DataService {

    private _data$: Subject<any>;

    constructor(http:Http){
        this._data$ = new Subject();
    }
   
   setData(data:any):void{
       console.log("SET DATA");
        this._data$.next(data);
    }
   

    getData(){
        console.log("GET DATA");
        return this._data$.asObservable();
    }

    // private extractData(res: Response) {
    //     let body = res.json();
    //     return body || { };
    // }

    // private handleError (error: Response | any) {
    //     // In a real world app, we might use a remote logging infrastructure
    //     let errMsg: string;
    //     if (error instanceof Response) {
    //         const body = error.json() || '';
    //         const err = body.error || JSON.stringify(body);
    //         errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    //     } else {
    //         errMsg = error.message ? error.message : error.toString();
    //     }
    //     console.error(errMsg);
    //     return Promise.reject(errMsg);
    // }
}
