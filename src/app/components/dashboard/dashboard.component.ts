import { Subscription, Observable } from "rxjs/Rx";
import { Component } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
import { DashboardComponentResolver } from "./dashboard.resolver";
import { Initiative } from "../../shared/model/initiative.data";
import { ExportService } from "../../shared/services/export/export.service";
import { saveAs } from "file-saver"

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

    constructor(private resolver: DashboardComponentResolver, private exportService: ExportService) {
    }

    ngOnInit() {
        let start = new Date().getTime();
        this.isLoading = true;
        this.subscription = this.resolver.resolve(undefined, undefined)
            .subscribe((datasets: DataSet[]) => {
                this.datasets = datasets;
                datasets.forEach(d => {
                    this.isExportingMap.set(d._id, false);
                })
                this.isLoading = false;
                let end = new Date().getTime();
                console.log("elapsed", end - start)
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

    export(dataset: DataSet) {

        this.isExportingMap.set(dataset._id, true);
        this.exportService.getReport(dataset).subscribe((exportString: string) => {
            let blob = new Blob([exportString], { type: "text/csv" });
            saveAs(blob, `${dataset.initiative.name}.csv`);
        }
            ,
            (error: Error) => console.log("Error downloading the file."),
            () => {
                this.isExportingMap.set(dataset._id, false);

            }
        )
    }
}