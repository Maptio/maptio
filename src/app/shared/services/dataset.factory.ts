import { Injectable } from "@angular/core";
import { Http, RequestOptions, Response } from "@angular/http";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map"
import { DataSet } from "../model/dataset.data"
import { ErrorService } from "./error.service";
import { User } from '../model/user.data';
import 'rxjs/add/operator/toPromise';
import { Observable } from "rxjs/Rx";

@Injectable()
export class DatasetFactory {

    private _http: Http;
    private _data$: Subject<DataSet[]>;

    constructor(http: Http, public errorService: ErrorService) {
        this._data$ = new Subject<DataSet[]>();
        this._http = http;
    }


    delete(dataset: DataSet, user: User): Promise<boolean> {
        return this._http.delete("/api/v1/user/" + user.user_id + "/dataset/" + dataset.id)
            .map((responseData) => {
                return responseData.json();
            })
            .toPromise()
            .then(r => { return true; })
            .catch(this.errorService.handleError);
    }


    getAll(): Promise<DataSet[]> {
        throw new Error("Not implemented");
    }

    get(id: string): Promise<DataSet>;
    get(user: User): Promise<DataSet[]>;
    get(idOrUser: string | User): Promise<DataSet> | Promise<DataSet[]> | Promise<void> {
        if (idOrUser) {
            return (idOrUser instanceof User)
                ? this.getWithUser(<User>idOrUser)
                : this.getWithId(<string>idOrUser)
        }
        else {
            return Promise.reject("Parameter missing");
        }
    }


    private getWithUser(user: User): Promise<DataSet[]> {
        return this._http.get("/api/v1/user/" + user.user_id + "/datasets")
            .map((responseData) => {
                return responseData.json();
            })
            .map((user: any) => {
                let result: Array<DataSet> = [];
                (user.datasets || []).forEach((oid: any) => {
                    result.push(new DataSet({ id: oid }));
                });
                return result || [];
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
    }

    private getWithId(id: string): Promise<DataSet> {
        return this._http.get("/api/v1/dataset/" + id)
            .map((response: Response) => {
                let d = DataSet.create().deserialize(response.json());
                d.id = id; //reassign id 
                return d;
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
    }
}