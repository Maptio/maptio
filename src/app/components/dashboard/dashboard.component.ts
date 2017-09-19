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

export class DashboardComponent implements OnInit {

    public datasets$: Promise<Array<DataSet>>;
    public subscription: Subscription;

    constructor(private auth: Auth, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private errorService: ErrorService) {

        this.subscription = this.auth.getUser().subscribe((user: User) => {
            // this.user = user

            this.datasets$ = Promise
                .all(user.datasets.map(did => this.datasetFactory.get(did)))
                .then((datasets: Array<DataSet>) => {
                    return datasets.map(d => {
                        // console.log(d.initiative.name, d.initiative)
                        // console.log(d.initiative.name, "lloking for ", d.initiative.team_id)
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

    ngOnInit() { }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}