import { Observable } from 'rxjs/Rx';
import { ErrorService } from "./error/error.service";
import { User } from "./../model/user.data";
import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

@Injectable()
export class UserFactory {

    private _http: Http;
    constructor(private http: Http, public errorService: ErrorService) {
        this._http = http;
    }

    /** Gets all users
     *
     */
    getAll(pattern: string = ""): Promise<User[]> {
        return this.http.get("/api/v1/users/" + pattern)
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
            .then(r => r)
            .catch(this.errorService.handleError);

    }

    /** Gets a user using its uniquerId
     *  Returns undefined if no user is found
     */
    get(uniqueId: string): Promise<User> {
        return this.http.get("/api/v1/user/" + uniqueId)
            .map((response: Response) => {
                return User.create().deserialize(response.json());
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
    }

    /**
     * Creates a new user
     */
    create(input: any): Promise<User> {
        return this.http.post("/api/v1/user", input)
            .map((responseData) => {
                return responseData.json();
            })
            .map((input: any) => {
                return User.create().deserialize(input);
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
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
            .then(r => { return true })
            .catch(this.errorService.handleError);
    }
}