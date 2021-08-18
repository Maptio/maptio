import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from "rxjs";

import { SubSink } from 'subsink';

import { CircleMapData } from '@maptio-shared/model/circle-map-data.interface';
import { EmbeddableDatasetService } from '../../embeddable-dataset.service';


@Component({
    selector: "maptio-embed",
    templateUrl: "./embed.page.html",
    styleUrls: ["./embed.page.scss"]
})
export class EmbedComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  datasetId: string | null = null;
  dataset: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Hardcoding the color as the colour is only stored in localstorage, which
  // means we can't use it for publicly shareable and embeddable apps
  seedColor = '#3599af';

  circleMapData$ = new BehaviorSubject<CircleMapData>(undefined);

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private datasetService: EmbeddableDatasetService,
  ) {}

  ngOnInit(): void {
    this.datasetId = this.route.snapshot.paramMap.get('id');

    this.subs.sink = this.datasetService.getDataset(this.datasetId)
      .subscribe((dataset: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        this.dataset = dataset;

        if (this.dataset && this.dataset.initiative) {
          const circleMapData: CircleMapData = {
            dataset: this.dataset,
            rootInitiative: this.dataset.initiative,
            seedColor: this.seedColor,
          };

          this.circleMapData$.next(circleMapData);
        }

        if (this.dataset === null) {
          this.isLoading = false;
        }
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
