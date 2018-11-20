import { AuthHttp } from "angular2-jwt";

import { DataSet } from "./../model/dataset.data";
import { Injectable } from "@angular/core";
import { Response } from "@angular/http";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map"
import { User } from "../model/user.data";
import "rxjs/add/operator/toPromise";
import { Team } from "../model/team.data";
import * as shortid from "shortid";

@Injectable()
export class DatasetFactory {

    private _http: AuthHttp;
    private _data$: Subject<DataSet[]>;

    constructor(http: AuthHttp) {
        this._data$ = new Subject<DataSet[]>();
        this._http = http;
    }


    upsert(dataset: DataSet, datasetId?: string): Promise<boolean> {
        return this._http.put("/api/v1/dataset/" + (dataset.datasetId || datasetId), dataset)
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
        return this._http.put("/api/v1/user/" + user.user_id + "/dataset/" + dataset.datasetId, null)
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
                return DataSet.create().deserialize(response.json());
            })
            .toPromise()
    }


    /**
     * Deletes a dataset from the collection of the given user
     * @param dataset Dataset to delete
     * @param user User attached to dataset
     */
    // delete(dataset: DataSet, user: User): Promise<boolean> {
    //     return this._http.delete("/api/v1/user/" + user.user_id + "/dataset/" + dataset._id)
    //         .map((responseData) => {
    //             return responseData.json();
    //         })
    //         .toPromise()
    //         .then(r => { return true; })
    // }


    // getAll(): Promise<DataSet[]> {
    //     throw new Error("Not implemented");
    // }

    /**
    *  Retrieves a list dataset matching given ids
    * @param id List of dataset ids
    */
    get(ids: string[], isMinimal?: boolean): Promise<DataSet[]>;
    /**
     *  Retrieves a dataset matching a given id
     * @param id Unique dataset id
     */
    get(id: string): Promise<DataSet>;
    /**
     * Retrieves a collection of datasets for a given user
     * @param user User
     */
    get(user: User): Promise<string[]>;
    /**
     * Retrieves one or many datasets
     * @param idOrUser Dataset unique ID or User
     */
    get(team: Team): Promise<DataSet[]>;
    /**
     * Retrieves one or many datasets
     * @param idOrUser Dataset unique ID or User
     */
    get(idOrUserOrTeam: string | string[] | User | Team, isMinimal?: boolean): Promise<DataSet> | Promise<DataSet[]> | Promise<string[]> | Promise<void> {

        if (!idOrUserOrTeam) return Promise.reject("Parameter missing");
        if (idOrUserOrTeam instanceof User) {
            return this.getWithUser(<User>idOrUserOrTeam)
        }
        if (idOrUserOrTeam instanceof Team) {
            return this.getWithTeam(<Team>idOrUserOrTeam)
        }
        if (idOrUserOrTeam.constructor === Array) {
            return this.getWithIds(<string[]>idOrUserOrTeam, isMinimal)
        }
        return this.getWithId(<string>idOrUserOrTeam)
    }


    private getWithUser(user: User): Promise<string[]> {
        return this._http.get("/api/v1/user/" + user.user_id + "/datasets")
            .map((responseData) => {
                try {
                    return responseData.json().map((d: any) => d._id);
                }
                catch (err) {
                    return []
                }
            })
            .map((result: any) => {
                return result;
            })
            .toPromise()
    }

    private getWithTeam(team: Team): Promise<DataSet[]> {
        return this._http.get("/api/v1/team/" + team.team_id + "/datasets")
            .map((responseData) => {
                return responseData.json();
            })
            .map((inputs: Array<any>) => {
                let result: Array<DataSet> = [];
                if (inputs) {
                    inputs.forEach((input) => {
                        result.push(DataSet.create().deserialize(input));
                    });
                }
                return result;
            })
            .toPromise()
    }

    private getWithId(id: string): Promise<DataSet> {
        return this._http.get("/api/v1/dataset/" + id)
            .map((response: Response) => {
                let d = DataSet.create().deserialize(response.json());
                d.datasetId = id; // reassign id
                return d;
            })
            .toPromise()
    }

    private getWithIds(datasetIds: string[], isMinimal: boolean): Promise<DataSet[]> {
        if (!datasetIds || datasetIds.length === 0) {
            return Promise.reject("You cannot make a search for all datasets !")
        }
        return this._http.get(`/api/v1/dataset/in/${datasetIds.join(",")}${isMinimal ? "/minimal" : ""}`)
            .map((responseData) => {
                return responseData.json();
            })
            .map((inputs: Array<any>) => {
                let result: Array<DataSet> = [];
                if (inputs) {
                    inputs.forEach((input) => {
                        result.push(DataSet.create().deserialize(input));
                    });
                }
                return result;
            })
            .toPromise()
    }
}