import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from "rxjs";

import { SubSink } from 'subsink';

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
  seedColor: string;
  dataset$ = new BehaviorSubject<any>(undefined); // eslint-disable-line @typescript-eslint/no-explicit-any
  seedColor$ = new BehaviorSubject<string>('');

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private datasetService: EmbeddableDatasetService,
  ) {}

  ngOnInit(): void {
    this.getDataset();

    // Hardcoding the color as the colour is only stored in localstorage, which
    // means we can't use it for publicly shareable and embeddable apps
    this.seedColor$.next('#3599af');
  }

  getDataset(): void {
    this.datasetId = this.route.snapshot.paramMap.get('id');
    this.subs.sink = this.datasetService.getDataset(this.datasetId)
      .subscribe((dataset: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log('hello?');
        console.log(dataset);
        this.dataset = dataset;
        this.dataset$.next(this.dataset);
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
