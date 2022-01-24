import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { DataSet } from '../../../model/dataset.data';
import { ExportService } from '../../../services/export/export.service';
import { saveAs } from 'file-saver';
import { DatasetFactory } from '../../../../core/http/map/dataset.factory';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { cloneDeep, escape } from 'lodash-es';
import { Permissions } from '../../../model/permission.data';

@Component({
  selector: 'common-card-map',
  templateUrl: './card-map.component.html',
  styleUrls: ['./card-map.component.css'],
})
export class CardMapComponent implements OnInit {
  @Input('dataset') dataset: DataSet;
  @Input('isExportAvailable') isExportAvailable: Boolean;
  @Input('isTeamDisplayed') isTeamDisplayed: Boolean;
  @Input('isEdit') isEdit: Boolean;
  @Input('isReadOnly') isReadOnly: Boolean;

  @Output('copied') copied: EventEmitter<DataSet> = new EventEmitter<DataSet>();
  @Output('archived')
  archived: EventEmitter<DataSet> = new EventEmitter<DataSet>();
  @Output('restored')
  restored: EventEmitter<DataSet> = new EventEmitter<DataSet>();

  isExporting: Boolean;
  isEditing: Boolean;
  isTogglingEmbedding = false;
  isTogglingEmbeddingFailed = false;
  isEmbedInstructionsPopoverOpen = false;
  isCopying: boolean;
  isRestoring: Boolean;
  isArchiving: Boolean;
  isUpdateFailed: Boolean;
  form: FormGroup;
  isEditAvailable: Boolean;
  Permissions = Permissions;

  embeddingIntroduction = '';
  embeddingInstructions = '';

  constructor(
    private exportService: ExportService,
    private datasetFactory: DatasetFactory,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      mapName: new FormControl('', {
        validators: [Validators.required],
        updateOn: 'submit',
      }),
    });

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const shareableUrl = `${baseUrl}/share/${this.dataset.datasetId}`;
    const embedUrl = `${baseUrl}/embed/${this.dataset.datasetId}`;
    const iframeStyle = 'height: 100%; width: 100%; border: none;';
    const iframeSnippet = escape(
      `<iframe src="${embedUrl}" style="${iframeStyle}"></iframe>`
    );

    this.embeddingIntroduction = `
            Enabling this feature will allow you to embed this map on your
            website as well as get a publicly-shareable link.
            The map will be accessible to anyone with the URL.
        `;

    this.embeddingInstructions = `
            This map can be viewed publicly at the following URL:
            <a href="${shareableUrl}">
              ${shareableUrl}
            </a>
            <br>
            <br>

            You can embed this map on your website by using the following code snippet:
            <br>
            <code>
              ${iframeSnippet}
            </code>
            <br>
            <br>

            <p>
              To stop sharing the map, click "Disable" below.
              Please make sure you remove the code snippet from your website before you do this.
            </p>
        `;
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
        let blob = new Blob([exportString], { type: 'text/csv' });
        saveAs(blob, `${dataset.initiative.name}.csv`);
      },
      (error: Error) => console.error(error),
      () => {
        this.isExporting = false;
      }
    );
  }

  enableEmbedding() {
    this.toggleEmbedding(true, () => {
      this.isEmbedInstructionsPopoverOpen = true;
    });
  }

  disableEmbedding() {
    this.toggleEmbedding(false);
  }

  toggleEmbedding(isEmbeddable: boolean, successCallback?: Function) {
    if (this.isTogglingEmbedding) return;

    this.isTogglingEmbedding = true;
    this.isTogglingEmbeddingFailed = false;
    this.cd.markForCheck();

    this.dataset.isEmbeddable = isEmbeddable;
    return this.datasetFactory
      .upsert(this.dataset)
      .then((result) => {
        if (result) {
          this.isTogglingEmbedding = false;
          successCallback();
          this.cd.markForCheck();
        } else {
          this.isTogglingEmbeddingFailed = true;
          this.cd.markForCheck();
        }
      })
      .catch(() => {
        this.isTogglingEmbeddingFailed = true;
        this.cd.markForCheck();
      });
  }

  save() {
    if (this.form.valid) {
      this.isEditing = false;
      this.isUpdateFailed = false;

      this.dataset.initiative.name = this.form.controls['mapName'].value;
      this.datasetFactory
        .upsert(this.dataset)
        .then((success: Boolean) => {
          if (success) {
            this.form.reset();
            this.isEditing = false;
            this.cd.markForCheck();
          } else {
            this.isUpdateFailed = true;
            this.cd.markForCheck();
          }
        })
        .catch(() => {});
    }
  }

  duplicate() {
    if (!this.isCopying) {
      this.isCopying = true;
      this.cd.markForCheck();
      let copy = cloneDeep(this.dataset);
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

  archive() {
    if (this.isArchiving) return;

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

  restore() {
    if (this.isRestoring) return;

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
}
