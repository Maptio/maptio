import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, ChangeDetectorRef } from "@angular/core";
import { Subscription, Observable } from "../../../../node_modules/rxjs";
import { ActivatedRoute } from "../../../../node_modules/@angular/router";
import { DataSet } from "../../shared/model/dataset.data";
import { Team } from "../../shared/model/team.data";
import { User } from "../../shared/model/user.data";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { TeamFactory } from "../../shared/services/team.factory";
import { sortBy } from "lodash";

@Component({
    selector: "home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class HomeComponent {
    private routeSubscription: Subscription;
    public datasets: DataSet[];
    public teams: Team[];

    constructor(public auth: Auth, private route: ActivatedRoute, private cd: ChangeDetectorRef,
        public datasetFactory: DatasetFactory, public teamFactory: TeamFactory) { }

    ngOnInit(): void {
        this.routeSubscription = this.auth.getUser()
            .mergeMap((user: User) => {
                return Observable.forkJoin(this.datasetFactory.get(user.datasets), this.teamFactory.get(user.teams));
            })
            .map(([datasets, teams]: [DataSet[], Team[]]) => {
                return [
                    datasets.map(d => {
                        let i = 0
                        d.initiative.traverse((n) => { i++ })
                        d.depth = i;
                        return d;
                    }),
                    teams
                ]
            })
            .map(([datasets, teams]: [DataSet[], Team[]]) => {
                return [datasets.map(d => {
                    d.team = teams.find(t => d.initiative.team_id === t.team_id);
                    return d
                }), teams]
            })
            .map(([datasets, teams]: [DataSet[], Team[]]) => {
                return { datasets: sortBy(datasets, d => d.initiative.name), teams: teams }
            })
            .subscribe((data: { datasets: DataSet[], teams: Team[] }) => {
                this.teams = data.teams;
                this.datasets = data.datasets
                console.log(this.datasets, this.teams)
                this.cd.markForCheck();
            });

    }

    ngOnDestroy(): void {
        this.routeSubscription.unsubscribe();
    }

}