
import { DataSet } from "./../model/dataset.data";
import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map"
import { ErrorService } from "./error/error.service";
import { User } from "../model/user.data";
import "rxjs/add/operator/toPromise";

@Injectable()
export class DatasetFactory {

    private _http: Http;
    private _data$: Subject<DataSet[]>;

    constructor(http: Http, public errorService: ErrorService) {
        this._data$ = new Subject<DataSet[]>();
        this._http = http;
    }


    upsert(dataset: DataSet, datasetId?: string): Promise<boolean> {
        return this._http.put("/api/v1/dataset/" + (dataset._id || datasetId), dataset)
            .map((responseData) => {
                return responseData.json();
            })
            .toPromise()
            .then(r => { return true; })
            .catch(this.errorService.handleError);
    }


    /**
     * @param dataset
     * @param user
     */
    add(dataset: DataSet, user: User): Promise<boolean> {
        return this._http.put("/api/v1/user/" + user.user_id + "/dataset/" + dataset._id, null)
            .map((responseData) => {
                return responseData.json();
            })
            .toPromise()
            .then(r => { return true; })
            .catch(this.errorService.handleError);
    }

    /**
     * Creates a new dataset
     * @param dataset Dataset to create
     */
    create(dataset: DataSet): Promise<DataSet> {
        if (!dataset) throw new Error("Parameter missing");
        return this._http.post("/api/v1/dataset", dataset)
            .map((response: Response) => {
                return DataSet.create().deserialize(response.json());
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError)
    }


    /**
     * Deletes a dataset from the collection of the given user
     * @param dataset Dataset to delete
     * @param user User attached to dataset
     */
    delete(dataset: DataSet, user: User): Promise<boolean> {
        return this._http.delete("/api/v1/user/" + user.user_id + "/dataset/" + dataset._id)
            .map((responseData) => {
                return responseData.json();
            })
            .toPromise()
            .then(r => { return true; })
            .catch(this.errorService.handleError);
    }


    // getAll(): Promise<DataSet[]> {
    //     throw new Error("Not implemented");
    // }

    /**
     *  Retrieves a dataset matching a given id
     * @param id Unique dataset id
     */
    get(id: string): Promise<DataSet>;
    /**
     * Retrieves a collection of datasets for a given user
     * @param user User
     */
    get(user: User): Promise<DataSet[]>;
    /**
     * Retrieves one or many datasets
     * @param idOrUser Dataset unique ID or User
     */
    get(idOrUser: string | User): Promise<DataSet> | Promise<DataSet[]> | Promise<void> {
        if (!idOrUser) return Promise.reject("Parameter missing");
        return (idOrUser instanceof User)
            ? this.getWithUser(<User>idOrUser)
            : this.getWithId(<string>idOrUser)
    }


    private getWithUser(user: User): Promise<DataSet[]> {
        return this._http.get("/api/v1/user/" + user.user_id + "/datasets")
            .map((responseData) => {
                return responseData.json();
            })
            .map((user: any) => {
                let result: Array<DataSet> = [];
                (user.datasets || []).forEach((oid: any) => {
                    result.push(new DataSet({ _id: oid }));
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
                d._id = id; // reassign id
                return d;
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
    }
}