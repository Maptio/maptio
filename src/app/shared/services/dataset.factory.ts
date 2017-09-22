import { AuthHttp } from "angular2-jwt";

import { DataSet } from "./../model/dataset.data";
import { Injectable } from "@angular/core";
import {  Response } from "@angular/http";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map"
import { ErrorService } from "./error/error.service";
import { User } from "../model/user.data";
import "rxjs/add/operator/toPromise";
import { Team } from "../model/team.data";
import * as shortid from "shortid";

@Injectable()
export class DatasetFactory {

    private _http: AuthHttp;
    private _data$: Subject<DataSet[]>;

    constructor(http: AuthHttp, public errorService: ErrorService) {
        this._data$ = new Subject<DataSet[]>();
        this._http = http;
    }


    upsert(dataset: DataSet, datasetId?: string): Promise<boolean> {
        return this._http.put("/api/v1/dataset/" + (dataset._id || datasetId), dataset.initiative)
            .map((responseData) => {
                return responseData.json();
            })
            .toPromise()
            .then(r => { return true; })
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
    }

    /**
     * Creates a new dataset
     * @param dataset Dataset to create
     */
    create(dataset: DataSet): Promise<DataSet> {
        dataset.shortid = shortid.generate();
        if (!dataset) throw new Error("Parameter missing");
        return this._http.post("/api/v1/dataset", dataset)
            .map((response: Response) => {
                // console.log("response", response.json());
                return DataSet.create().deserialize(response.json());
            })
            .toPromise()
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
    get(team: Team): Promise<DataSet[]>;
    /**
     * Retrieves one or many datasets
     * @param idOrUser Dataset unique ID or User
     */
    get(idOrUserOrTeam: string | User | Team): Promise<DataSet> | Promise<DataSet[]> | Promise<void> {
        if (!idOrUserOrTeam) return Promise.reject("Parameter missing");
        if (idOrUserOrTeam instanceof User) {
            return this.getWithUser(<User>idOrUserOrTeam)
        }
        if (idOrUserOrTeam instanceof Team) {
            return this.getWithTeam(<Team>idOrUserOrTeam)
        }
        return this.getWithId(<string>idOrUserOrTeam)
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
    }

    private getWithTeam(team: Team): Promise<DataSet[]> {
        // console.log("/api/v1/team/" + team.team_id + "/datasets")
        return this._http.get("/api/v1/team/" + team.team_id + "/datasets")
            .map((responseData) => {
                return responseData.json();
            })
            .map((datasets: any) => {
                return datasets || [];
            })
            .toPromise()
    }

    private getWithId(id: string): Promise<DataSet> {
        return this._http.get("/api/v1/dataset/" + id)
            .map((response: Response) => {
                let d = DataSet.create().deserialize(response.json());
                d._id = id; // reassign id
                return d;
            })
            .toPromise()
    }
}