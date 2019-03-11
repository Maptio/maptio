import { Http } from "@angular/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators"

@Injectable()
export class JwtEncoder {

    constructor(private http: Http) {
    }

    public encode(payload: any): Promise<string> {
        return this.http.post("/api/v1/jwt/encode", payload)
            .pipe(
                map((responseData) => {
                    return responseData.json().token;
                })
            )
            .toPromise()
    }

    public decode(token: string): Promise<any> {
        return this.http.get("/api/v1/jwt/decode/" + token)
            .pipe(
                map((responseData) => {
                    return responseData.json();
                })
            )
            .toPromise()
    }
}
