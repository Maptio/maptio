import { Http } from "@angular/http";
// import { AuthHttp } from "angular2-jwt";
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
    }

    public decode(token: string): Promise<any> {
        return this.http.get("/api/v1/decode/" + token)
            .map((responseData) => {
                return responseData.json();
            })
            .toPromise()
    }
}
