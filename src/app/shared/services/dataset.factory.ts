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


    getAll(): Promise<DataSet[]> {
        throw new Error("Not implemented");
    }

    get(id: string): Promise<DataSet>;
    get(user: User): Promise<DataSet[]>;
    get(idOrUser: string | User): Promise<DataSet> | Promise<DataSet[]> {
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
                if (user.datasets) {
                    user.datasets.forEach((oid: any) => {
                        result.push(new DataSet({ id: oid }));
                    });
                }
                return result;
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
    }

    private getWithId(id: string): Promise<DataSet> {
        return this._http.get("/api/v1/dataset/" + id)
            .map((response: Response) => {
                return DataSet.create().deserialize(response.json());
            })
            .toPromise()
            .then(r => r)
            .catch(this.errorService.handleError);
    }
}


// import {$http} from 'xhr-factory';

// export const TodoFactory = {

//   getAll :function(){
//   	return $http.get('/api/v1/todos');
//   },

//   get:function(id){
//   	return $http.get('/api/v1/todo/'+id);
//   },

//   save: function(todo){
//   	return $http.post('/api/v1/todo', todo);
//   },

//   update: function(todo){
//   	return $http.put('/api/v1/todo/'+todo._id, todo);
//   },

//   delete: function(id){
//   	return $http.delete('/api/v1/todo/'+id);
//   }

// };