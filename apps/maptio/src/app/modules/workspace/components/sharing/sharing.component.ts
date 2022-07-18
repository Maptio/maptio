import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';

import { DataSet } from '@maptio-shared/model/dataset.data';
import { MapService } from '@maptio-shared/services/map/map.service';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';

@Component({
  selector: 'maptio-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss'],
})
export class SharingComponent implements OnInit {
  @Input() dataset: DataSet;

  isTogglingEmbedding = false;
  isTogglingEmbeddingFailed = false;
  shareableUrl = '';
  iframeSnippet = '';
  isTogglingShowingDescriptions = false;
  hasTogglingShowingDescriptionsFailed = false;

  constructor(
    private cd: ChangeDetectorRef,
    private datasetFactory: DatasetFactory,
    private mapService: MapService
  ) {}

  ngOnInit() {
    this.prepareEmbeddingInstructions();
  }

  private prepareEmbeddingInstructions() {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    this.shareableUrl = `${baseUrl}/share/${this.dataset.datasetId}`;

    const embedUrl = `${baseUrl}/embed/${this.dataset.datasetId}`;
    const iframeStyle = 'height: 100%; width: 100%; border: none;';
    this.iframeSnippet = `<iframe src="${embedUrl}" style="${iframeStyle}"></iframe>`;
  }

  enableEmbedding() {
    this.toggleEmbedding(true);
  }

  async disableEmbedding() {
    await this.toggleEmbedding(false);
  }

  private async toggleEmbedding(isEmbeddable: boolean) {
    if (this.isTogglingEmbedding) return;

    if (await this.mapService.isDatasetOutdated(this.dataset)) {
      this.alertAboutOutdatedDataset();
      return;
    }

    this.isTogglingEmbedding = true;
    this.isTogglingEmbeddingFailed = false;
    this.cd.markForCheck();

    this.dataset.isEmbeddable = isEmbeddable;
    return this.datasetFactory
      .upsert(this.dataset)
      .then((result) => {
        if (result) {
          this.isTogglingEmbedding = false;
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

  async toggleShowingDescriptions(event: Event) {
    if (this.isTogglingShowingDescriptions) {
      return;
    }

    const target = event?.target as HTMLInputElement;

    if (await this.mapService.isDatasetOutdated(this.dataset)) {
      this.alertAboutOutdatedDataset();
      target.checked = !target.checked;
      return;
    }

    this.isTogglingShowingDescriptions = true;
    this.hasTogglingShowingDescriptionsFailed = false;
    this.cd.markForCheck();

    this.dataset.showDescriptions = target.checked;

    let result = false;
    try {
      result = await this.datasetFactory.upsert(this.dataset);
    } catch {
      // Error handled below
      result = false;
    }

    if (!result) {
      this.hasTogglingShowingDescriptionsFailed = true;
      this.dataset.showDescriptions = !this.dataset.showDescriptions;
      target.checked = this.dataset.showDescriptions;
    }

    this.isTogglingShowingDescriptions = false;
    this.cd.markForCheck();
  }

  private alertAboutOutdatedDataset() {
    alert(
      'A friendly heads-up: Your map has been changed by another user (or by you in a different browser tab). Please hit refresh to load the latest version before changing map sharing settings. Sorry for the hassle.'
    );
  }
}
