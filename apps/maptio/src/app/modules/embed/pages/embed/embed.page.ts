import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta } from '@angular/platform-browser';

import { BehaviorSubject } from 'rxjs';

import { SubSink } from 'subsink';

import { CircleMapData } from '@maptio-shared/model/circle-map-data.interface';
import { EmbeddableDatasetService } from '../../embeddable-dataset.service';
import { CircleMapComponent } from '../../../circle-map/circle-map.component';

@Component({
  selector: 'maptio-embed',
  templateUrl: './embed.page.html',
  styleUrls: ['./embed.page.scss'],
  imports: [CircleMapComponent],
})
export class EmbedComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  datasetId: string | null = null;
  dataset: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  circleMapData$ = new BehaviorSubject<CircleMapData>(undefined);

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private metaTagService: Meta,
    private datasetService: EmbeddableDatasetService,
  ) {}

  ngOnInit(): void {
    // Disable browser zooming because it is then almost impossible to get out
    // of as we're overriding pinch gestures to offer in-app zooming
    this.metaTagService.updateTag({
      name: 'viewport',
      content: 'width=device-width, user-scalable=no',
    });

    this.datasetId = this.route.snapshot.paramMap.get('id');

    this.subs.sink = this.datasetService
      .getDataset(this.datasetId)
      .subscribe((dataset: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        this.dataset = dataset;

        if (this.dataset && this.dataset.initiative) {
          const circleMapData: CircleMapData = {
            dataset: this.dataset,
            rootInitiative: this.dataset.initiative,
            seedColor: this.getSeedColor(),
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

  /**
   * Prevent pinch zooming on credit notice from making page so zoomed out it
   * becomes unusable. This is necessary on top of `user-scalable=no` because
   * the latter is not respected by Safari on iOS.
   */
  onCreditPinch($event: TouchInput) {
    $event.preventDefault();
  }

  /**
   * Read seed colour from the dataset if it's set
   */
  getSeedColor(): string {
    if (this.dataset?.seedColor) {
      return this.dataset.seedColor;
    } else {
      // If the colour is not set in the database, we can't default to the
      // local storage colour on the embeddable version of the map, so we just
      // use the default Maptio colour
      return '#3599af';
    }
  }
}
