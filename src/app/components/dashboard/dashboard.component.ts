import { Subscription } from "rxjs/Rx";
import { Component } from "@angular/core";
import { DataSet } from "../../shared/model/dataset.data";
import { DashboardComponentResolver } from "./dashboard.resolver";
import { Initiative } from "../../shared/model/initiative.data";
import { ExportService } from "../../shared/services/export/export.service";
import {saveAs}  from "file-saver"

@Component({
    selector: "dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent {

    datasets: DataSet[];
    public subscription: Subscription;
    public isLoading: boolean;

    constructor(private resolver: DashboardComponentResolver, private exportService: ExportService) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.subscription = this.resolver.resolve(undefined, undefined)
            .subscribe((datasets: DataSet[]) => {
                this.datasets = datasets;
                this.isLoading = false;
            },
            (error: any) => { this.isLoading = false; },
            () => { this.isLoading = false; });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    export(dataset: DataSet) {
        this.exportService.getReport(dataset).subscribe((exportString: string) => {
            let blob = new Blob([exportString], { type: "text/csv" });
            saveAs(blob, `${dataset.initiative.name}.csv`);
        }
            ,
            (error: Error) => console.log("Error downloading the file."),
            () => console.info("OK")
        );
    }
}