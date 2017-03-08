import { Observable } from 'rxjs/Rx';
import { DataSet } from './../../shared/model/dataset.data';
import { DatasetFactory } from './../../shared/services/dataset.factory';
import { User } from './../../shared/model/user.data';
import { Auth } from './../../shared/services/auth.service';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'account',
    template: require("./account.component.html")
})
export class AccountComponent implements OnInit {

    private user: User;
    private datasets$: Observable<Array<DataSet>>;
    private message: string;

    constructor(private auth: Auth, private datasetFactory: DatasetFactory) {

    }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.auth.getUser().subscribe(
            (user: User) => {
                this.user = user;
                this.datasetFactory.get(this.user).then(o => {
                    this.datasets$ = Observable.of(o);

                    this.datasets$.toPromise().then((datasets: DataSet[]) => {
                        (datasets || []).forEach(function (d: DataSet, i: number, set: DataSet[]) {

                            this.datasetFactory.get(d.id).then((resolved: DataSet) => {
                                set[i] = resolved;
                            }
                            );
                        }.bind(this));

                    }
                        ,
                        (reason: any) => { console.log("REASON IS " + reason) })
                },
                    (error: any) => { console.log(error) }
                );
            });
    }


    open(dataset: DataSet) {
        console.log("OPEN " + dataset.id)
    }

    delete(dataset: DataSet) {
        this.datasetFactory.delete(dataset, this.user).then((result: boolean) => {
            this.message = "Dataset " + dataset.id + " " + dataset.name + " was succefully deleted";
            console.log(this.message);
            this.refresh();
        });
    }
}