import { Injectable, OnInit } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject'
import 'rxjs/add/operator/map'
import {DataSet} from '../model/dataset.data'

@Injectable()
export class DataSetService {

    private http:Http;
    private _data$: Subject<DataSet[]>;


    /*
    *   These will be reocrded under an account later.
    */
    private DATASETS: Array<DataSet> = [
        new DataSet("VESTD", '../../../assets/datasets/vestd.json') ,
        new DataSet("MIKE BOSTOCK",'../../../assets/datasets/mbostock.json') ,
        new DataSet("DUMMY", '../../../assets/datasets/dummy.json') 
    ];

    constructor(http:Http){
        this._data$ = new Subject<DataSet[]>();
        this.http = http;
    }
   

    getData():Promise<DataSet[]>{
        return this.http.get('')
               .toPromise()
               .then(response => this.DATASETS)
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
