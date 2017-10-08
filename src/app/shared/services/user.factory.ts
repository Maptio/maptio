import { AuthHttp } from "angular2-jwt";
import { Observable } from "rxjs/Rx";
import { User } from "./../model/user.data";
import { Injectable } from "@angular/core";
import { Response } from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import * as shortid from "shortid";

@Injectable()
export class UserFactory {

    private _http: AuthHttp;
    constructor(private http: AuthHttp) {
        this._http = http;
    }

    /** Gets all users
     *
     */
    getAll(pattern: string): Promise<User[]> {
        if (!pattern || pattern === "") {
            return Promise.reject("You cannot make a search for all users !")
        }
        return this.http.get("/api/v1/user/all/" + pattern)
            .map((responseData) => {
                return responseData.json();
            })
            .map((inputs: Array<any>) => {
                let result: Array<User> = [];
                if (inputs) {
                    inputs.forEach((input) => {
                        result.push(User.create().deserialize(input));
                    });
                }
                return result;
            })
            .toPromise()

    }

    getUsers(usersId: string[]): Promise<User[]> {
        if (!usersId || usersId.length === 0) {
            return Promise.reject("You cannot make a search for all users !")
        }
        return this.http.get("/api/v1/user/in/" + usersId.join(","))
            .map((responseData) => {
                return responseData.json();
            })
            .map((inputs: Array<any>) => {
                let result: Array<User> = [];
                if (inputs) {
                    inputs.forEach((input) => {
                        result.push(User.create().deserialize(input));
                    });
                }
                return result;
            })
            .toPromise()
    }

    /** Gets a user using its uniquerId
     *  Returns undefined if no user is found
     */
    get(uniqueId: string): Promise<User> {
        // console.log("GET", "/api/v1/user/" + uniqueId)
        return this.http.get("/api/v1/user/" + uniqueId)
            .map((response: Response) => {
                return User.create().deserialize(response.json());
            })
            .toPromise()
    }

    getByShortId(shortid: string): Promise<User> {
        // console.log("GET", "/api/v1/user/" + uniqueId)
        return this.http.get("/api/v1/user/" + shortid)
            .map((response: Response) => {
                return User.create().deserialize(response.json());
            })
            .toPromise()
    }

    /**
     * Creates a new user
     */
    create(input: User): Promise<User> {
        input.shortid = shortid.generate();
        return this.http.post("/api/v1/user", input)
            .map((responseData) => {
                return responseData.json();
            })
            .map((input: any) => {
                return User.create().deserialize(input);
            })
            .toPromise()
    }

    /**
     * Upsert a user
     * @param   user    User to update or insert
     * @returns         True if upsert has succeded, false otherwise
     */
    upsert(user: User): Promise<boolean> {
        // FIXME : does this handle error well ? Write a test
        return this.http.put("/api/v1/user/" + user.user_id, user)
            .map((responseData) => {
                return responseData.json();
            })
            .toPromise()
            .then(r => { return true });
    }
}