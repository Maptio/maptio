import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  isDevMode,
} from "@angular/core";
import { Router } from "@angular/router";

import { tap } from 'rxjs/operators';
import { Observable, Subject, partition, combineLatest } from "rxjs";

import { SubSink } from 'subsink';

import { hierarchy, pack } from 'd3-hierarchy';

import { URIService } from "../../../../shared/services/uri/uri.service";
import { DataService } from "../../services/data.service";
import { UIService } from "../../services/ui.service";
import { ColorService } from "@maptio-shared/services/color/color.service";
import { PermissionsService } from "../../../../shared/services/permissions/permissions.service";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { Initiative } from "../../../../shared/model/initiative.data";
import { SelectableTag } from "../../../../shared/model/tag.data";
import { IDataVisualizer } from "../../components/canvas/mapping.interface";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { Team } from "../../../../shared/model/team.data";

import { InitiativeViewModel, InitiativeNode } from '@maptio-circle-map/initiative.model';
import { CircleMapService } from "@maptio-circle-map/circle-map.service";


@Component({
  selector: "maptio-circles-gradual-reveal",
  templateUrl: "./mapping.circles-gradual-reveal.component.html",
  styleUrls: ["./mapping.circles-gradual-reveal.component.css"],
  host: { 'class': 'padding-100 w-100 h-auto d-block position-relative' },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingCirclesGradualRevealComponent implements IDataVisualizer, OnInit, OnDestroy {
  // OLD CODE:
  // private browser: Browsers;
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
  // public selectableUsers$: Observable<Array<SelectableUser>>;
  public isReset$: Observable<boolean>;
  public mapColor$: Observable<string>;
  public zoomInitiative$: Observable<Initiative>;
  // public forceZoom$: Observable<Initiative>;
  // public isLocked$: Observable<boolean>;

  public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
  public showToolipOf$: Subject<{ initiatives: Initiative[], isNameOnly: boolean }> = new Subject<{ initiatives: Initiative[], isNameOnly: boolean }>();
  public showContextMenuOf$: Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }> = new Subject<{ initiatives: Initiative[], x: Number, y: Number, isReadOnlyContextMenu: boolean }>();

  // // private zoomSubscription: Subscription;
  // private dataSubscription: Subscription;
  // private resetSubscription: Subscription;
  // private lockedSubscription: Subscription;
  // private tagsSubscription: Subscription;
  // private selectableTagsSubscription: Subscription;

  // private zooming: any;

  public analytics: Angulartics2Mixpanel;

  // private svg: any;
  // private g: any;
  // private diameter: number;
  // private definitions: any;
  // private outerFontScale: ScaleLogarithmic<number, number>;
  // private innerFontScale: ScaleLogarithmic<number, number>;
  // public isWaitingForDestinationNode = false;
  // public isTooltipDescriptionVisible = false;
  // public isFirstEditing = false;
  // public isLocked: boolean;
  // public isLoading: boolean;

  // public selectedNode: Initiative;
  // public selectedNodeParent: Initiative;
  // public hoveredNode: Initiative;

  // public slug: string;

  // CIRCLE_RADIUS = 16;
  // MAX_TEXT_LENGTH = 35;
  // TRANSITION_DURATION = 500;
  // ZOOMING_TRANSITION_DURATION = 500;
  // TRANSITION_OPACITY = 750;
  // RATIO_FOR_VISIBILITY = 0.08;
  // FADED_OPACITY = 0.1;
  // MAX_NUMBER_LETTERS_PER_CIRCLE = 15;
  // MIN_TEXTBOX_WIDTH = 100;
  // T: any;

  // POSITION_INITIATIVE_NAME = { x: 0.9, y: 0.1, fontRatio: 1 };
  // POSITION_TAGS_NAME = { x: 0, y: 0.3, fontRatio: 0.65 };
  // POSITION_ACCOUNTABLE_NAME = { x: 0, y: 0.45, fontRatio: 0.9 };
  // DEFAULT_PICTURE_ANGLE = Math.PI - Math.PI * 36 / 180;

  // counter = 0;



  // FROM NEW MAP UX:
  private subs = new SubSink();

  dataset: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  seedColor: string;

  // circles: InitiativeNode[] = [];
  // rootCircle: InitiativeNode | undefined = undefined;
  // primaryCircles: InitiativeNode[] = [];

  // isFirstLoad = true;


  constructor(
    public colorService: ColorService,
    public uiService: UIService,
    public router: Router,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    // private uriService: URIService,
    private loaderService: LoaderService,
    // private permissionsService: PermissionsService,
    private circleMapService: CircleMapService,
  ) {
    // this.T = d3.transition(null).duration(this.TRANSITION_DURATION);
  }

  ngOnInit() {
    this.loaderService.show();

    const data$ = this.dataService.get();

    this.subs.sink = combineLatest([
      data$,
      this.mapColor$
    ])
    .subscribe(
      (complexData: [any, string]) => {
        this.dataset = <any>complexData[0].initiative;
        this.seedColor = complexData[1];

        // const [clearSearchInitiative, highlightInitiative] = partition(
        //   this.zoomInitiative$,
        //   node => node === null
        // );

        // clearSearchInitiative.subscribe(() => {
        //   this.clearCircleStates();
        //   this.circleMapService.deselectSelectedCircle();
        //   this.toggleInfoPanelBasedOnSelectedCircle();
        //   this.circleMapService.resetZoom();
        //   this.cd.markForCheck();
        // });

        // highlightInitiative.subscribe(node => {
        //   const highlightedCircle = this.circles.find((circle) => circle.data.id === node.id);
        //   if (highlightedCircle) {
        //     this.clearCircleStates();
        //     this.circleMapService.selectCircle(highlightedCircle);
        //     this.circleMapService.resetZoom();
        //     this.circleMapService.zoomToCircle(highlightedCircle);
        //     this.cd.markForCheck();
        //   }
        // });

        // } else {
        //   // Trigger this method not just when a circle is selected but also any time data is updated
        //   this.adjustPrimaryCircleSelectionBasedOnSelectedCircle();
        // }

        this.cd.markForCheck();
      },
      (err) => {
        if (!isDevMode) {
          console.error(err)
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
    this.showToolipOf$.next({ initiatives: [circle.data as unknown as Initiative], isNameOnly: false });
  }

  hideInfoPanel() {
    this.showToolipOf$.next({ initiatives: null, isNameOnly: false });
  }
}
