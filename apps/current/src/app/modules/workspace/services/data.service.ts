
import {filter} from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable ,  ReplaySubject, Subject } from "rxjs";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { ErrorService } from "../../../shared/services/error/error.service"
import { Tag, SelectableTag } from "../../../shared/model/tag.data";

@Injectable()
export class DataService {

    private _data$: ReplaySubject<any>;

    constructor() {
        this._data$ = new ReplaySubject();
    }

    set(data: any): void {
        this._data$.next(data);
    }

    get(): Observable<any> {
        return this._data$.asObservable();
    }

    // fetch(url: string): Promise<any> {
    //     return this.http.get(url)
    //         .toPromise()
    //         .then(response => response.json())
    //         .catch(this.errorService.handleError);
    // }
}


export class CounterService {

    private _counter$: ReplaySubject<{ datasetId: String, time: any }>;

    // private updateMap: Map<String, number>;
    constructor() {
        this._counter$ = new ReplaySubject();
        // this.updateMap = new Map<String, number>();
    }

    set(data: { datasetId: String, time: any }): void {
        this._counter$.next(data);
    }

    get(datasetId: String): Observable<{ datasetId: String, time: any }> {
        return this._counter$.asObservable().pipe(filter(c => c.datasetId === datasetId))
    }
}


