import { HttpClient } from '@angular/common/http';

import {map} from 'rxjs/operators';
import { User } from "../../../shared/model/user.data";
import { Injectable } from "@angular/core";
import { Response } from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import * as shortid from "shortid";
import { chunk, flattenDeep } from "lodash-es";

@Injectable()
export class UserFactory {
  constructor(private http: HttpClient) {}

  /** Gets all users
   *
   */
  getAll(pattern: string): Promise<User[]> {
    if (!pattern || pattern === "") {
      return Promise.reject("You cannot make a search for all users !");
    }
    return this.http
      .get("/api/v1/user/all/" + pattern).pipe(
      map(responseData => {
        return responseData;
      }),
      map((inputs: Array<any>) => {
        let result: Array<User> = [];
        if (inputs) {
          inputs.forEach(input => {
            result.push(User.create().deserialize(input));
          });
        }
        return result;
      }),)
      .toPromise();
  }

  getUsers(usersId: string[]): Promise<User[]> {
    if (!usersId || usersId.length === 0) {
      return Promise.reject("You cannot make a search for all users !");
    }
    let chunks = chunk(usersId, 50);

    return Promise.all(
      chunks.map(chunkusersId =>
        this.http
          .get("/api/v1/user/in/" + chunkusersId.join(",")).pipe(
          map(responseData => {
            return responseData
          }),
          map((inputs: Array<any>) => {
            let result: Array<User> = [];
            if (inputs) {
              inputs.forEach(input => {
                result.push(User.create().deserialize(input));
              });
            }
            return result;
          }),)
          .toPromise()
      )
    ).then(array => {
      return <User[]>flattenDeep(array);
    });
  }

  /** Gets a user using its uniquerId
   *  Returns undefined if no user is found
   */
  get(uniqueId: string): Promise<User> {
    return this.http
      .get("/api/v1/user/" + uniqueId).pipe(
      map((response: Response) => {
        return User.create().deserialize(response);
      }))
      .toPromise();
  }

  // getByShortId(shortid: string): Promise<User> {
  //     return this.http.get("/api/v1/user/" + shortid)
  //         .map((response: Response) => {
  //             return User.create().deserialize(response.json());
  //         })
  //         .toPromise()
  // }

  /**
   * Creates a new user
   */
  create(input: User): Promise<User> {
    input.shortid = shortid.generate();
    return this.http
      .post("/api/v1/user", input).pipe(
      map(responseData => {
        return responseData
      }),
      map((input: any) => {
        return User.create().deserialize(input);
      }),)
      .toPromise();
  }

  /**
   * Upsert a user
   * @param   user    User to update or insert
   * @returns         True if upsert has succeded, false otherwise
   */
  upsert(user: User): Promise<boolean> {
    return this.http
      .put("/api/v1/user/" + user.user_id, user).pipe(
      map(responseData => {
        return responseData
      }))
      .toPromise()
      .then(r => {
        return true;
      });
  }
}
