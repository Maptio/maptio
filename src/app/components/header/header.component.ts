import { Router } from "@angular/router";
import { EmitterService } from "./../../shared/services/emitter.service";
import { ErrorService } from "./../../shared/services/error.service";
import { EventEmitter } from "@angular/core";
import { Component, OnInit, Input, Output } from "@angular/core";
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
    @Output("createDataset") createDatasetEvent = new EventEmitter<void>();

    private datasets$: Promise<Array<DataSet>>;
    private selectedDatasetName: string;
    private isValid: boolean = false;
    private newDatasetName: string;

    constructor(private auth: Auth, private datasetFactory: DatasetFactory, private errorService: ErrorService, private router: Router) { }

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
        EmitterService.get("datasetName").subscribe((value: string) => { this.selectedDatasetName = value; });
        this.router.navigate(["workspace", dataset._id]);
    }

    createDataset() {
        let newDataset = new DataSet({ name: this.newDatasetName, createdOn: new Date() });
        this.datasetFactory.create(newDataset).then((created: DataSet) => {
            this.datasetFactory.add(created, this.user).then((result: boolean) => {
                this.openDataset(created);
            }).catch(this.errorService.handleError);
        }).catch(this.errorService.handleError);
        this.ngOnInit();
    }

    // TODO: create validation service
    validate(name: string) {
        this.newDatasetName = name.trim();
        this.isValid = this.newDatasetName !== "" && this.newDatasetName !== undefined;
    }

}