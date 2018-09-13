import { isEmpty } from 'lodash';
import { Component, ChangeDetectorRef, SimpleChanges, Input } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
// import { DashboardComponentResolver } from "./dashboard.resolver";
import { Team } from '../../shared/model/team.data';

@Component({
    selector: "dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent {

    @Input("datasets") datasets: DataSet[];
    @Input("teams") teams: Team[];

    isZeroMaps: Boolean = true;
    isZeroTeam: Boolean = true;
    isZeroInitiative: Boolean = true;
    isZeroTeammates: Boolean = true;
    teamId: String;
    datasetId: String;

    constructor(private cd: ChangeDetectorRef) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.datasets && changes.datasets.currentValue) {
            this.datasets = changes.datasets.currentValue;
            this.isZeroMaps = isEmpty(this.datasets);
            if (!this.isZeroMaps) {
                this.datasetId = this.datasets[0].datasetId;
                this.isZeroInitiative = !this.datasets[0].initiative.children;
            }
        }

        if (changes.teams && changes.teams.currentValue) {
            this.isZeroTeam = isEmpty(changes.teams.currentValue)
            if (!this.isZeroTeam) {
                this.teamId = changes.teams.currentValue[0].team_id;
                this.isZeroTeammates = (<Team>changes.teams.currentValue[0]).members.length === 1;
            }
        }
        this.cd.markForCheck();
    }

    isOnboarding() {
        return this.isZeroTeam || this.isZeroMaps || this.isZeroInitiative;
    }


}