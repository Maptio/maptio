import {
  Component,
  OnInit,
  OnChanges,
  Input,
  ChangeDetectorRef,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { cloneDeep } from 'lodash-es';
import { saveAs } from 'file-saver';

import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { MapService } from '@maptio-shared/services/map/map.service';
import { ExportService } from '@maptio-shared/services/export/export.service';
import { Permissions } from '@maptio-shared/model/permission.data';

@Component({
  selector: 'maptio-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.css'],
})
export class MapCardComponent implements OnInit, OnChanges {
  @Input() dataset: DataSet;
  @Input() isExportAvailable: boolean;
  @Input() isTeamDisplayed: boolean;
  @Input() isEdit: boolean;
  @Input() isReadOnly: boolean;

  @Output() copied: EventEmitter<DataSet> = new EventEmitter<DataSet>();
  @Output() archived: EventEmitter<DataSet> = new EventEmitter<DataSet>();
  @Output() restored: EventEmitter<DataSet> = new EventEmitter<DataSet>();

  isExporting: boolean;
  isEditing: boolean;

  isCopying: boolean;
  isRestoring: boolean;
  isArchiving: boolean;
  isUpdateFailed: boolean;
  form: FormGroup;
  isEditAvailable: boolean;
  Permissions = Permissions;

  // Variables for configuring embedding
  isConfiguringEmbedding = false;

  constructor(
    private cd: ChangeDetectorRef,
    private datasetFactory: DatasetFactory,
    private mapService: MapService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      mapName: new FormControl('', {
        validators: [Validators.required],
        updateOn: 'submit',
      }),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isEdit && changes.isEdit.currentValue) {
      this.isEditAvailable = changes.isEdit.currentValue;
    }
  }

  export(dataset: DataSet) {
    this.isExporting = true;
    this.exportService.getReport(dataset).subscribe(
      (exportString: string) => {
        const blob = new Blob([exportString], { type: 'text/csv' });
        saveAs(blob, `${dataset.initiative.name}.csv`);
      },
      (error: Error) => console.error(error),
      () => {
        this.isExporting = false;
      }
    );
  }

  toggleConfiguringEmbedding() {
    this.isConfiguringEmbedding = !this.isConfiguringEmbedding;
    this.cd.markForCheck();
  }

  save() {
    if (this.form.valid) {
      this.isEditing = false;
      this.isUpdateFailed = false;

      this.dataset.initiative.name = this.form.controls['mapName'].value;
      this.datasetFactory.upsert(this.dataset).then((success: boolean) => {
        if (success) {
          this.form.reset();
          this.isEditing = false;
          this.cd.markForCheck();
        } else {
          this.isUpdateFailed = true;
          this.cd.markForCheck();
        }
      });
      // TODO: No error handling, need to change this!
      // .catch(() => {});
    }
  }

  duplicate() {
    if (!this.isCopying) {
      this.isCopying = true;
      this.cd.markForCheck();
      const copy = cloneDeep(this.dataset);
      copy.initiative.name = `${this.dataset.initiative.name} [duplicate]`;
      return this.datasetFactory
        .create(copy)
        .then((dataset) => {
          this.copied.emit(dataset);
        })
        .then(() => {
          this.isCopying = false;
          this.cd.markForCheck();
        });
    }
  }

  async archive() {
    if (this.isArchiving) return;

    if (await this.mapService.isDatasetOutdated(this.dataset)) {
      this.alertAboutOutdatedDataset();
      return;
    }

    this.isArchiving = true;
    this.cd.markForCheck();
    this.dataset.isArchived = true;

    return this.datasetFactory
      .upsert(this.dataset)
      .then((result) => {
        if (result) this.archived.emit(this.dataset);
      })
      .then(() => {
        this.isArchiving = false;
        this.cd.markForCheck();
      });
  }

  async restore() {
    if (this.isRestoring) return;

    if (await this.mapService.isDatasetOutdated(this.dataset)) {
      this.alertAboutOutdatedDataset();
      return;
    }

    this.isRestoring = true;
    this.cd.markForCheck();
    this.dataset.isArchived = false;

    return this.datasetFactory
      .upsert(this.dataset)
      .then((result) => {
        if (result) this.restored.emit(this.dataset);
      })
      .then(() => {
        this.isRestoring = false;
        this.cd.markForCheck();
      });
  }

  private alertAboutOutdatedDataset() {
    alert(
      'A friendly heads-up: Your map has been changed by another user (or by you in a different browser tab). Please hit refresh to load the latest version before changing map sharing settings. Sorry for the hassle.'
    );
  }
}
