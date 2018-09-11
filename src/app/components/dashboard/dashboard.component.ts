import { User } from './../../shared/model/user.data';
import { Auth } from './../../shared/services/auth/auth.service';
import { isEmpty } from 'lodash';
import { Subscription } from "rxjs/Rx";
import { Component, ChangeDetectorRef, SimpleChanges, Input } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
import { DashboardComponentResolver } from "./dashboard.resolver";
import { ExportService } from "../../shared/services/export/export.service";
import { saveAs } from "file-saver"
import { EmitterService } from "../../shared/services/emitter.service";
import { Team } from '../../shared/model/team.data';
import { TeamFactory } from '../../shared/services/team.factory';

@Component({
    selector: "dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent {

    @Input("datasets") datasets: DataSet[];
    @Input("teams") teams: Team[];
    isZeroMaps: Boolean;
    isZeroTeam: Boolean;
    isZeroInitiative: Boolean;
    isZeroTeammates: Boolean;
    teamId: String;
    datasetId: String;

    isExportingMap: Map<string, boolean> = new Map<string, boolean>();

    constructor(
        private exportService: ExportService,
        private cd: ChangeDetectorRef, private teamFactory: TeamFactory) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.datasets && changes.datasets.currentValue) {
            this.datasets = changes.datasets.currentValue;
            this.isZeroMaps = isEmpty(this.datasets);
            if (!this.isZeroMaps) {
                this.datasetId = this.datasets[0].datasetId;
                this.datasets.forEach(d => {
                    this.isExportingMap.set(d.datasetId, false);
                })
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
        this.cd.markForCheck()
    }

    ngOnDestroy() {

    }

    isDisplayLoader(datasetId: string) {
        return this.isExportingMap.get(datasetId);
    }


    isOnboarding() {
        return this.isZeroTeam || this.isZeroMaps || this.isZeroInitiative;
    }

    export(dataset: DataSet) {

        this.isExportingMap.set(dataset.datasetId, true);
        this.exportService.getReport(dataset).subscribe((exportString: string) => {
            let blob = new Blob([exportString], { type: "text/csv" });
            saveAs(blob, `${dataset.initiative.name}.csv`);
        }
            ,
            (error: Error) => console.log("Error downloading the file."),
            () => {
                this.isExportingMap.set(dataset.datasetId, false);

            }
        )
    }
}