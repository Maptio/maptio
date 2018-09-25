import { Component, OnInit, Input } from '@angular/core';
import { DataSet } from '../../model/dataset.data';
import { ExportService } from '../../services/export/export.service';
import { saveAs } from "file-saver"

@Component({
    selector: 'common-card-map',
    templateUrl: './card-map.component.html',
    styleUrls: ['./card-map.component.css']
})
export class CardMapComponent implements OnInit {

    @Input("dataset") dataset: DataSet;
    @Input("isExportAvailable") isExportAvailable: Boolean;

    isExporting: Boolean;

    constructor(private exportService: ExportService) { }

    ngOnInit(): void { }

    export(dataset: DataSet) {
        this.isExporting = true;
        this.exportService.getReport(dataset).subscribe((exportString: string) => {
            let blob = new Blob([exportString], { type: "text/csv" });
            saveAs(blob, `${dataset.initiative.name}.csv`);
        }
            ,
            (error: Error) => console.log("Error downloading the file."),
            () => {
                this.isExporting = false;
            }
        )
    }
}
