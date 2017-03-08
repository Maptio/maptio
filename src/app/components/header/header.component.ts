import { Http } from '@angular/http';
import { UserFactory } from './../../shared/services/user.factory';
import { Component, OnInit, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { DataSet } from "./../../shared/model/dataset.data";
import { User } from "./../../shared/model/user.data";
import { Auth } from "./../../shared/services/auth.service";

@Component({
    selector: "header",
    template: require("./header.component.html"),
    styles: [require("./header.component.css").toString()]
})

export class HeaderComponent implements OnInit {
    @Input("user") user: User;

    @Output("openHelp") openHelpEvent = new EventEmitter<void>();
    @Output("openDataset") openDatasetEvent = new EventEmitter<DataSet>();

    private datasets$: Promise<Array<DataSet>>;
    private selectedDatasetName: string;

    constructor(private auth: Auth, private datasetFactory: DatasetFactory) { }

    ngOnInit() {
        this.auth.getUser().subscribe(
            (user: User) => {
                this.user = user;
                console.log(this.user);
                console.log(this.auth.authenticated());
                this.datasetFactory.get(this.user).then(o => {
                    this.datasets$ = Promise.resolve(o);
                    this.datasets$.then((datasets: DataSet[]) => {
                        (datasets || []).forEach(function (d: DataSet, i: number, set: DataSet[]) {
                            this.datasetFactory.get(d.id).then((resolved: DataSet) => {
                                set[i] = resolved;
                            }
                            );
                        }.bind(this));

                    },
                        (reason: any) => { console.log("REASON IS " + reason) }
                    )
                },
                    (reason: any) => { console.log("REASON IS " + reason) })
            },
            (error: any) => { console.log(error) }
        );
    }

    openHelp() {
        this.openHelpEvent.emit();
    }

    openDataset(dataset: DataSet) {
        this.selectedDatasetName = dataset.name;
        this.openDatasetEvent.emit(dataset);
    }

}