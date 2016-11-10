import { Injectable, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject'
import 'rxjs/add/operator/map'

@Injectable()
export class DataService {

    private http:Http;
    private _data$: Subject<any>;

    constructor(http:Http){
        this._data$ = new Subject();
        this.http = http;
    }
   
    setData(data:any):void{
        this._data$.next(data);
    }
   

    getData(){
        return this._data$.asObservable();
    }

    loadData(url:string){
        return this.http.request(url)
                 .map(res => res.json())
                 .subscribe(
                    data => { this._data$.next(data)},
                    err => this.handleError(err),
                    () => console.log('load done: ' + url)
                );
    }

    getRawData(url:string):Promise<any>{
        return this.http.get(url)
               .toPromise()
               .then(response => response.json())
               .catch(this.handleError);
    }

    private handleError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Promise.reject(errMsg);
    }
}
