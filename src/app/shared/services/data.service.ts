import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { ErrorService } from "./error/error.service"
import { ReplaySubject, Subject } from "rxjs/Rx";
import { Tag, SelectableTag } from "../model/tag.data";

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



