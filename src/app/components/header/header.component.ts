import { ErrorService } from './../../shared/services/error.service';
import { UserFactory } from './../../shared/services/user.factory';
import { DataService } from './../../shared/services/data.service';
import { EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { Component, OnInit, ViewChild, Input, Output } from '@angular/core';
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
    @Output("createDataset") createDatasetEvent = new EventEmitter<void>();

    private datasets$: Promise<Array<DataSet>>;
    private selectedDatasetName: string;

    constructor(private auth: Auth, private datasetFactory: DatasetFactory, private errorService: ErrorService) { }

    ngOnInit() {
        this.auth.getUser().subscribe(
            (user: User) => {
                this.user = user;
                this.datasetFactory.get(this.user).then(o => {
                    this.datasets$ = Promise.resolve(o);
                    this.datasets$.then((datasets: DataSet[]) => {
                        (datasets || []).forEach(function (d: DataSet, i: number, set: DataSet[]) {
                            this.datasetFactory.get(d._id).then((resolved: DataSet) => {
                                set[i] = resolved;
                            }
                            );
                        }.bind(this));

                    },
                        (reason: any) => { this.errorService.handleError }
                    )
                },
                    (reason: any) => { this.errorService.handleError })
            },
            (error: any) => { this.errorService.handleError }
        );
    }

    openHelp() {
        this.openHelpEvent.emit();
    }

    openDataset(dataset: DataSet) {
        this.selectedDatasetName = dataset.name;
        this.openDatasetEvent.emit(dataset);
    }

    createDataset() {
        let newDataset = new DataSet({ name: "" });
        this.datasetFactory.create(newDataset).then((created: DataSet) => {
            this.datasetFactory.add(created, this.user).then((result: boolean) => {
                this.openDataset(created);
            }).catch(this.errorService.handleError);
        }).catch(this.errorService.handleError)
    }

}