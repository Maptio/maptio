import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

@Injectable()
export class JwtEncoder {
  constructor(private http: HttpClient) {}

  public encode(payload: any): Promise<string> {
    return this.http
      .post('/api/v1/jwt/encode', payload)
      .pipe(
        map((responseData: { token: string }) => {
          return responseData.token;
        })
      )
      .toPromise();
  }

  public decode(token: string): Promise<any> {
    return this.http.get('/api/v1/jwt/decode/' + token).toPromise();
  }
}
