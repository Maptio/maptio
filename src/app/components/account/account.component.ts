import { Subscription } from "rxjs/Rx";
import { TeamComponent } from "./../team/team.component";
import { TeamFactory } from "./../../shared/services/team.factory";
import { EmitterService } from "./../../shared/services/emitter.service";
import { ErrorService } from "./../../shared/services/error/error.service";
import { Router } from "@angular/router";
import { DataSet } from "./../../shared/model/dataset.data";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { User } from "./../../shared/model/user.data";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Team } from "../../shared/model/team.data";
import { UserFactory } from "../../shared/services/user.factory";

@Component({
    selector: "account",
    template: require("./account.component.html"),
    styleUrls: ["./account.component.css"]
})
export class AccountComponent implements OnInit {

    private user: User;
    public datasets$: Promise<Array<DataSet>>;
    subscription: Subscription;

    @ViewChild(TeamComponent) teamComponent: TeamComponent;

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    constructor(private auth: Auth, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private errorService: ErrorService) {
        this.subscription = this.auth.getUser().subscribe((user: User) => {
            this.user = user

            // this.datasets$ = Promise
            //     .all(user.datasets.map(did => this.datasetFactory.get(did)))
            //     .then((datasets: Array<DataSet>) => {
            //         return datasets.map(d => {
            //             // console.log(d.initiative.name, d.initiative)
            //             // console.log(d.initiative.name, "lloking for ", d.initiative.team_id)
            //             this.teamFactory.get(d.initiative.team_id).then(team => { d.team = team })
            //             return d;
            //         })
            //     })
            //     .then((datasets: Array<DataSet>) => {
            //         return datasets.sort((a: DataSet, b: DataSet) => {
            //             if (a.initiative.name < b.initiative.name) return -1;
            //             if (a.initiative.name > b.initiative.name) return 1;
            //             return 0;
            //         })
            //     })
        },
            (error: any) => { this.errorService.handleError(error) });


    }

    ngOnInit() {

        // this.refresh();
    }


    // getTeam(team_id: string): Promise<Team> {
    //     return this.teamFactory.get(team_id);
    // }

    // private refresh() {

    // }

    // deleteDataset(dataset: DataSet) {
    //     this.datasetFactory.delete(dataset, this.user).then((result: boolean) => {
    //         if (result) {
    //             this.message = "Dataset " + dataset.initiative.name + " was successfully deleted";
    //         }
    //         else {
    //             this.errorService.handleError(new Error("Dataset " + dataset.initiative.name + " cannot be deleted"));
    //         }
    //         this.refresh();
    //     });
    // }

}