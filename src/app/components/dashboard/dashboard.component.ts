import { isEmpty } from 'lodash';
import { Component, ChangeDetectorRef, SimpleChanges, Input } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
// import { DashboardComponentResolver } from "./dashboard.resolver";
import { Team } from '../../shared/model/team.data';
import { User } from '../../shared/model/user.data';

@Component({
    selector: "dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent {

    @Input("datasets") datasets: DataSet[];
    @Input("teams") teams: Team[];
    @Input("user") user: User;

    isZeroTeam: Boolean = true;
    isZeroMaps: Boolean = true;
    isZeroInitiative: Boolean = true;
    // isZeroTeammates: Boolean = true;

    constructor(private cd: ChangeDetectorRef) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.datasets && changes.datasets.currentValue) {
            this.datasets = changes.datasets.currentValue;
            this.isZeroMaps = isEmpty(this.datasets);
            if (!this.isZeroMaps) {
                this.isZeroInitiative = !this.datasets[0].initiative.children || this.datasets[0].initiative.children.length === 0;
            }
        }

        if (changes.teams && changes.teams.currentValue) {
            this.isZeroTeam = isEmpty(changes.teams.currentValue)
        }
        this.cd.markForCheck();
    }

    isOnboarding() {
        return this.isZeroTeam || this.isZeroMaps || this.isZeroInitiative;
    }

}