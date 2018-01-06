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



export class URIService {
    parseFragment(fragment: string): Map<string, string> {
        if (!fragment) return new Map<string, string>();
        var query = new Map<string, string>();
        var pairs = (fragment[0] === '#' ? fragment.substr(1) : fragment).split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            query.set(decodeURIComponent(pair[0]), pair[1] ? decodeURIComponent(pair[1]) : undefined);
        }
        return query;
    }

    buildFragment(data: Map<string, string>): string {
        let fragment = "";
        data.forEach((v, k, map) => {
            fragment += `${k}=${v}&`
        });
        return fragment;
    }
}