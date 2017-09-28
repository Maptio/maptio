import { Subscription } from "rxjs/Rx";
import { Component, OnInit } from "@angular/core";
import { Auth } from "../../shared/services/auth/auth.service";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { TeamFactory } from "../../shared/services/team.factory";
import { ErrorService } from "../../shared/services/error/error.service";
import { User } from "../../shared/model/user.data";
import { DataSet } from "../../shared/model/dataset.data";

@Component({
    selector: "dashboard",
    template: require("./dashboard.component.html"),
    styleUrls: ["./dashboard.component.css"]
})

export class DashboardComponent {

    public datasets$: Promise<Array<DataSet>>;
    public subscription: Subscription;

    constructor(public auth: Auth, public datasetFactory: DatasetFactory, public teamFactory: TeamFactory, public errorService: ErrorService) {

        this.subscription = this.auth.getUser().subscribe((user: User) => {
            this.datasets$ = Promise
                .all(user.datasets.map(did => this.datasetFactory.get(did)
                    .then(d => d, () => { return Promise.reject("No dataset") }).catch(() => { return <DataSet>undefined }

                    )))
                .then((datasets: Array<DataSet>) => {
                    return datasets.filter(d => { return d !== undefined }).map(d => {
                        this.teamFactory.get(d.initiative.team_id).then(team => { d.team = team }, () => { d.team = undefined })
                        return d;
                    })
                })
                .then((datasets: Array<DataSet>) => {
                    return datasets.sort((a: DataSet, b: DataSet) => {
                        if (a.initiative.team_id < b.initiative.team_id) return -1;
                        if (a.initiative.team_id > b.initiative.team_id) return 1;
                        return 0;
                    })
                })
        },
            (error: any) => { this.errorService.handleError(error) });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}