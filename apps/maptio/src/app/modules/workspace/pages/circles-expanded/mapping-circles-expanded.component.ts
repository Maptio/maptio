import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  isDevMode,
  effect,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';

import {
  Observable,
  Subject,
  partition,
  combineLatest,
  BehaviorSubject,
} from 'rxjs';

import { SubSink } from 'subsink';

import { DataService } from '../../services/data.service';
import { UIService } from '../../services/ui.service';
import { ColorService } from '@maptio-shared/services/color/color.service';
import { Initiative } from '../../../../shared/model/initiative.data';
import { SelectableTag } from '../../../../shared/model/tag.data';
import { IDataVisualizer } from '../../components/canvas/mapping.interface';
import { LoaderService } from '../../../../shared/components/loading/loader.service';
import { Team } from '../../../../shared/model/team.data';

import { CircleMapDataExpanded } from '@maptio-shared/model/circle-map-data.interface';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { InitiativeNode } from '@maptio-circle-map-expanded/initiative.model';
import { CircleMapService } from '@maptio-circle-map-expanded/circle-map.service';
import { CircleMapExpandedComponent } from '../../../circle-map-expanded/circle-map-expanded.component';
import { OnboardingMessageComponent } from '../../../onboarding-message/onboarding-message/onboarding-message.component';

import { WorkspaceFacade } from '../../+state/workspace.facade';

@Component({
    selector: 'maptio-circles-expanded',
    templateUrl: './mapping-circles-expanded.component.html',
    styleUrls: ['./mapping-circles-expanded.component.css'],
    host: { class: 'padding-100 w-100 h-auto d-block position-relative' },
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [OnboardingMessageComponent, CircleMapExpandedComponent]
})
export class MappingCirclesExpandedComponent
  implements IDataVisualizer, OnInit, OnDestroy
{
  workspaceFacade = inject(WorkspaceFacade);

  public datasetId: string;
  public width: number;
  public height: number;
  public translateX: number;
  public translateY: number;
  public scale: number;
  public tagsState: Array<SelectableTag>;

  public margin: number;
  public zoom$: Observable<number>;
  public selectableTags$: Observable<Array<SelectableTag>>;
  public isReset$: Observable<boolean>;
  public mapColor$: Observable<string>;
  public zoomInitiative$: Observable<Initiative>;

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  public showToolipOf$: Subject<{
    initiatives: Initiative[];
    isNameOnly: boolean;
  }> = new Subject<{ initiatives: Initiative[]; isNameOnly: boolean }>();
  public showContextMenuOf$: Subject<{
    initiatives: Initiative[];
    x: number;
    y: number;
    isReadOnlyContextMenu: boolean;
  }> = new Subject<{
    initiatives: Initiative[];
    x: number;
    y: number;
    isReadOnlyContextMenu: boolean;
  }>();

  private subs = new SubSink();

  dataset: DataSet;
  seedColor: string;

  circleMapData$ = new BehaviorSubject<CircleMapDataExpanded>(undefined);

  isFirstLoad = true;

  selectedCircleId = this.workspaceFacade.selectedInitiativeId;

  constructor(
    public colorService: ColorService,
    public uiService: UIService,
    public router: Router,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    // private uriService: URIService,
    private loaderService: LoaderService,
    // private permissionsService: PermissionsService,
    private circleMapService: CircleMapService
  ) {
    // this.T = d3.transition(null).duration(this.TRANSITION_DURATION);
  }

  ngOnInit() {
    this.loaderService.show();

    const data$ = this.dataService.get();

    this.subs.sink = combineLatest([
      data$,
      this.mapColor$,
      this.selectableTags$,
    ]).subscribe(
      (complexData: [any, string, SelectableTag[]]) => {
        if (this.isFirstLoad) {
          this.subs.sink = this.circleMapService.selectedCircle.subscribe(
            () => {
              this.toggleInfoPanelBasedOnSelectedCircle();
            }
          );

          const [clearSearchInitiative, highlightInitiative] = partition(
            this.zoomInitiative$,
            (node) => node === null
          );

          this.subs.sink = clearSearchInitiative.subscribe(() => {
            this.circleMapService.onClearSearchInitiative();
            this.toggleInfoPanelBasedOnSelectedCircle();
            this.cd.markForCheck();
          });

          this.subs.sink = highlightInitiative.subscribe((node) => {
            this.circleMapService.onHighlightInitiative(node);
            this.cd.markForCheck();
          });

          this.subs.sink = this.selectableTags$.subscribe((tagsStatus) => {
            this.circleMapService.onFilterByTag(tagsStatus);
            this.cd.markForCheck();
          });

          this.subs.sink = this.zoom$.subscribe((scaleChange) => {
            this.circleMapService.onZoomButtonPress(scaleChange);
            this.cd.markForCheck();
          });

          this.subs.sink = this.isReset$.subscribe(() => {
            this.circleMapService.onZoomFitButtonPress();
          });
        }

        const circleMapData: CircleMapDataExpanded = {
          dataset: complexData[0].dataset,
          rootInitiative: complexData[0].initiative,
          seedColor: complexData[1],
          tagsState: complexData[2],
        };

        this.circleMapData$.next(circleMapData);

        this.isFirstLoad = false;
        this.loaderService.hide();
        this.cd.markForCheck();
      },
      (err) => {
        if (!isDevMode) {
          console.error(err);
        }
      }
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // Only necessary for now because of data visualizer interface
  init() {}

  toggleInfoPanelBasedOnSelectedCircle() {
    const selectedCircle = this.circleMapService.selectedCircle.value;

    if (selectedCircle) {
      this.showInfoPanelFor(selectedCircle);
    } else {
      this.hideInfoPanel();
    }
  }

  showInfoPanelFor(circle: InitiativeNode) {
    this.showToolipOf$.next({
      initiatives: [circle.data as unknown as Initiative],
      isNameOnly: false,
    });
  }

  hideInfoPanel() {
    this.showToolipOf$.next({ initiatives: null, isNameOnly: false });
  }

  onSelectedCircleIdChange(circleId: number) {
    this.workspaceFacade.setSelectedInitiativeID(circleId);
  }
}
