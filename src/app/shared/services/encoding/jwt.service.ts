import { Http } from '@angular/http';
import { Injectable } from "@angular/core";
import * as jwt from "jsonwebtoken";
import { ErrorService } from "../error/error.service";


@Injectable()
export class JwtEncoder {

    private _http: Http;
    constructor(private http: Http, public errorService: ErrorService) {
        this._http = http;
    }

    public encode(payload: any): Promise<string> {
        return this.http.post("/api/v1/encode", payload)
            .map((responseData) => {
                return responseData.json().token;
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
    }

    public decode(token: string): Promise<any> {
        return this.http.post("/api/v1/encode", token)
        .map((responseData) => {
            return responseData.json();
        })
        .toPromise()
        .then(r => r)
        .catch(this.errorService.handleError);
    }
}