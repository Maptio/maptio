import { Subscription } from "rxjs/Rx";
import { Component, ChangeDetectorRef } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
import { DashboardComponentResolver } from "./dashboard.resolver";
import { ExportService } from "../../shared/services/export/export.service";
import { saveAs } from "file-saver"
import { EmitterService } from "../../shared/services/emitter.service";

@Component({
    selector: "dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent {

    datasets: DataSet[];
    public subscription: Subscription;
    public isLoading: boolean;

    isExportingMap: Map<string, boolean> = new Map<string, boolean>();

    constructor(private resolver: DashboardComponentResolver, private exportService: ExportService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.subscription = this.resolver.resolve(undefined, undefined)
            .subscribe((datasets: DataSet[]) => {
                this.datasets = datasets;
                datasets.forEach(d => {
                    this.isExportingMap.set(d.datasetId, false);
                })
                this.isLoading = false;
                this.cd.markForCheck();
            },
            (error: any) => { this.isLoading = false; },
            () => {
                this.isLoading = false;
            });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    isDisplayLoader(datasetId: string) {
        return this.isExportingMap.get(datasetId);
    }


    goTo(dataset: DataSet) {
        EmitterService.get("currentDataset").emit(dataset);
        EmitterService.get("currentTeam").emit(dataset.team)
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