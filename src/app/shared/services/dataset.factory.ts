import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map"
import { DataSet } from "../model/dataset.data"
import { ErrorService } from "./error.service";
import { AuthenticatedUser } from '../model/user.data';

@Injectable()
export class DatasetFactory {

    private _http: Http;
    private _data$: Subject<DataSet[]>;


    /*
    *   These will be reocrded under an account later.
    */
    // private DATASETS: Array<DataSet> = [
    //     new DataSet("Vestd", "../../../build/assets/datasets/vestd.json")
    //     // new DataSet("Mike Bostock's", '../../../assets/datasets/mbostock.json'),
    //     // new DataSet("Dummy", '../../../assets/datasets/dummy.json')
    // ];

    constructor(http: Http, public errorService: ErrorService) {
        this._data$ = new Subject<DataSet[]>();
        this._http = http;
    }


    get(user: AuthenticatedUser): Promise<DataSet[]> {
        //this.DATASETS.push(new DataSet(user.name, "../../../assets/datasets/" + user.name + ".json"))
        // return this.http.get("")
        //     .toPromise()
        //     .then(response => this.DATASETS)
        //     .catch(this.errorService.handleError);
        return this._http.get('/api/v1/datasets').toPromise()
            .then(response => {
                let sets = new Array<DataSet>();
                sets.push(new DataSet({ name: "Vestd", url: "http://localhost:3000/api/v1/dataset/58b655a8f36d281facb72f56" }));
                return sets
            })
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