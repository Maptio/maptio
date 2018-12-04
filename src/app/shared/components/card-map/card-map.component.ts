import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { DataSet } from '../../model/dataset.data';
import { ExportService } from '../../services/export/export.service';
import { saveAs } from "file-saver"
import { DatasetFactory } from '../../services/dataset.factory';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { cloneDeep } from "lodash"
import { Permissions } from '../../model/permission.data';

@Component({
    selector: 'common-card-map',
    templateUrl: './card-map.component.html',
    styleUrls: ['./card-map.component.css']
})
export class CardMapComponent implements OnInit {

    @Input("dataset") dataset: DataSet;
    @Input("isExportAvailable") isExportAvailable: Boolean;
    @Input("isTeamDisplayed") isTeamDisplayed: Boolean;
    @Input("isEdit") isEdit: Boolean;

    @Output("copied") copied: EventEmitter<DataSet> = new EventEmitter<DataSet>();

    isExporting: Boolean;
    isEditing: Boolean;
    isCopying: Boolean;
    isUpdateFailed: Boolean;
    form: FormGroup;
    isEditAvailable: Boolean;
    Permissions = Permissions;

    constructor(private exportService: ExportService, private datasetFactory: DatasetFactory, private cd: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            "mapName": new FormControl("", {
                validators: [Validators.required],
                updateOn: "submit"
            })
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.isEdit && changes.isEdit.currentValue) {
            this.isEditAvailable = changes.isEdit.currentValue;
        }
    }

    export(dataset: DataSet) {
        this.isExporting = true;
        this.exportService.getReport(dataset).subscribe((exportString: string) => {
            let blob = new Blob([exportString], { type: "text/csv" });
            saveAs(blob, `${dataset.initiative.name}.csv`);
        }
            ,
            (error: Error) => console.error(error),
            () => {
                this.isExporting = false;
            }
        )
    }

    save() {
        if (this.form.valid) {
            this.isEditing = false;
            this.isUpdateFailed = false;

            this.dataset.initiative.name = this.form.controls["mapName"].value;
            this.datasetFactory.upsert(this.dataset)
                .then((success: Boolean) => {
                    if (success) {
                        this.form.reset();
                        this.isEditing = false;
                        this.cd.markForCheck();
                    }
                    else {
                        this.isUpdateFailed = true;
                        this.cd.markForCheck();
                    }
                })
                .catch(() => {

                });
        }
    }

    duplicate() {
        if (this.isCopying) return;

        this.isCopying = true;
        this.cd.markForCheck();
        let copy = cloneDeep(this.dataset);
        copy.initiative.name = `${this.dataset.initiative.name} [duplicate]`;
        return this.datasetFactory.create(copy)
            .then(dataset => {
                this.copied.emit(dataset);
            })
            .then(() => {
                this.isCopying = false;
                this.cd.markForCheck();
            })

    }
}
