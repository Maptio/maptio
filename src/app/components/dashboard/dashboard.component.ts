import { Subscription } from "rxjs/Rx";
import { Component, OnInit } from "@angular/core";
import { Auth } from "../../shared/services/auth/auth.service";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { TeamFactory } from "../../shared/services/team.factory";
import { ErrorService } from "../../shared/services/error/error.service";
import { User } from "../../shared/model/user.data";
import { DataSet } from "../../shared/model/dataset.data";
import * as _ from "lodash";

@Component({
    selector: "dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})

export class DashboardComponent {

    public datasets$: Promise<Array<DataSet>>;
    public subscription: Subscription;
    public isLoading: boolean;

    constructor(public auth: Auth, public datasetFactory: DatasetFactory, public teamFactory: TeamFactory, public errorService: ErrorService) {
        this.isLoading = true;
        this.subscription = this.auth.getUser().subscribe((user: User) => {

            this.datasets$ = Promise
                .all(user.datasets.map(did => this.datasetFactory.get(did)
                    .then(d => d, () => { return Promise.reject("No dataset") }).catch(() => { return <DataSet>undefined }

                    )))
                .then(datasets => _.compact(datasets))
                .then((datasets: Array<DataSet>) => {
                    return datasets.map(d => {
                        this.teamFactory.get(d.initiative.team_id).then(team => { d.team = team }, () => { d.team = undefined })
                        return d;
                    })
                })
                .then(datasets => { this.isLoading = false; return _.sortBy(datasets, d => d.initiative.name) })
        },
            (error: any) => { this.errorService.handleError(error) });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}