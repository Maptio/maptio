import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  isDevMode,
} from "@angular/core";
import { Router } from "@angular/router";

import { tap, combineLatest } from 'rxjs/operators';
import { Observable, Subject, partition } from "rxjs";

import { SubSink } from 'subsink';

import { hierarchy, pack } from 'd3-hierarchy';

// import { URIService } from "../../../../shared/services/uri/uri.service";
// import { DataService } from "../../services/data.service";
// import { UIService } from "../../services/ui.service";
// import { PermissionsService } from "../../../../shared/services/permissions/permissions.service";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
// import { SelectableTag } from "../../../../shared/model/tag.data";
// import { IDataVisualizer } from "../../components/canvas/mapping.interface";
// import { Team } from "../../../../shared/model/team.data";

import { ColorService } from "@maptio-shared/services/color/color.service";
import { Initiative } from "@maptio-shared/model/initiative.data";
import { LoaderService } from "@maptio-shared/components/loading/loader.service";

import { InitiativeViewModel, InitiativeNode } from './initiative.model';
import { CircleMapService } from './circle-map.service';


@Component({
  selector: 'maptio-circle-map',
  templateUrl: './circle-map.component.html',
  styleUrls: ['./circle-map.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircleMapComponent implements OnInit, OnDestroy {
  // OLD CODE:
  // private browser: Browsers;
  // public datasetId: string;
  // public width: number;
  // public height: number;
  // public translateX: number;
  // public translateY: number;
  // public scale: number;
  // public tagsState: Array<SelectableTag>;

  // public margin: number;
  // public zoom$: Observable<number>;
  // public selectableTags$: Observable<Array<SelectableTag>>;
  // public selectableUsers$: Observable<Array<SelectableUser>>;
  // public isReset$: Observable<boolean>;
  // public mapColor$: Observable<string>;
  // public zoomInitiative$: Observable<Initiative>;

  public analytics: Angulartics2Mixpanel;

  public isLoading: boolean;

  public slug: string;

  private subs = new SubSink();

  @Input()
  get dataset(): any { return this._dataset; } // eslint-disable-line @typescript-eslint/no-explicit-any
  set dataset(dataset: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this._dataset = dataset;
    this.onInputChanges();
  }
  private _dataset: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  @Input()
  get seedColor(): string { return this._seedColor; }
  set seedColor(seedColor: string) {
    this._seedColor = seedColor;
    this.onInputChanges();
  }
  private _seedColor: string;

  circles: InitiativeNode[] = [];
  rootCircle: InitiativeNode | undefined = undefined;
  primaryCircles: InitiativeNode[] = [];

  isFirstLoad = true;


  constructor(
    public colorService: ColorService,
    // public uiService: UIService,
    // public router: Router,
    private cd: ChangeDetectorRef,
    // private dataService: DataService,
    // private uriService: URIService,
    private loaderService: LoaderService,
    // private permissionsService: PermissionsService,
    private circleMapService: CircleMapService,
  ) {
    // this.T = d3.transition(null).duration(this.TRANSITION_DURATION);
  }

  ngOnInit() {
    this.loaderService.show();

    // this.subs.sink = this.dataService
    //   .get()
    //   .pipe(
    //     combineLatest(this.mapColor$),
    //   )
    //   .subscribe(
    //     (complexData: [any, string]) => {
    //       let data = <any>complexData[0].initiative;
    //       this.datasetId = complexData[0].dataset.datasetId;
    //       this.tagsState = complexData[2];
    //       this.slug = data.getSlug();
    //       this.loaderService.show();

    //       this.dataset = data;
    //       this.circleMapService.setDataset(this.datasetId, this.dataset);
    //       this.seedColor = complexData[1];

    //       this.prepareLayout();
    //       this.clearCircleStates();
    //       this.identifyCircleTypes();
    //       this.assignColorsToCircles();

    //       const lastSelectedCircle = this.circleMapService.getLastSelectedCircle(this.circles);

    //       if(this.isFirstLoad) {
    //         this.circleMapService.resetZoom();
    //         this.subs.sink = this.circleMapService.selectedCircle.subscribe(() => {
    //           this.adjustPrimaryCircleSelectionBasedOnSelectedCircle();
    //           this.toggleInfoPanelBasedOnSelectedCircle();
    //           this.cd.markForCheck();
    //         });

    //         const [clearSearchInitiative, highlightInitiative] = partition(
    //           this.zoomInitiative$,
    //           node => node === null
    //         );

    //         clearSearchInitiative.subscribe(() => {
    //           this.clearCircleStates();
    //           this.circleMapService.deselectSelectedCircle();
    //           this.toggleInfoPanelBasedOnSelectedCircle();
    //           this.circleMapService.resetZoom();
    //           this.cd.markForCheck();
    //         });

    //         highlightInitiative.subscribe(node => {
    //           const highlightedCircle = this.circles.find((circle) => circle.data.id === node.id);
    //           if (highlightedCircle) {
    //             this.clearCircleStates();
    //             this.circleMapService.selectCircle(highlightedCircle);
    //             this.circleMapService.resetZoom();
    //             this.circleMapService.zoomToCircle(highlightedCircle);
    //             this.cd.markForCheck();
    //           }
    //         });
    //       } else {
    //         // Trigger this method not just when a circle is selected but also any time data is updated
    //         this.adjustPrimaryCircleSelectionBasedOnSelectedCircle();
    //       }

    //       if(lastSelectedCircle) {
    //         this.circleMapService.selectCircle(lastSelectedCircle);
    //         this.circleMapService.zoomToCircle(lastSelectedCircle);
    //       }

    //       this.isFirstLoad = false;
    //       this.loaderService.hide();
    //       this.analytics.eventTrack("Map", {
    //         action: "viewing",
    //         view: "initiatives",
    //         team: (<Team>complexData[0].team).name,
    //         teamId: (<Team>complexData[0].team).team_id
    //       });
    //       this.isLoading = false;
    //       this.cd.markForCheck();
    //     },
    //     (err) => {
    //       if (!isDevMode) {
    //         console.error(err)
    //       }
    //     }
    //   );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onInputChanges() {
    console.log('input to circle map changed');
  }

  prepareLayout() {
    const diameter = 1000;
    const margin = 15;
    const PADDING_CIRCLE = 20;

    const packInitiatives = pack<InitiativeViewModel>()
      .size([diameter - margin, diameter - margin])
      .padding(function () { // eslint-disable-line @typescript-eslint/no-explicit-any
        return PADDING_CIRCLE;
      });

    const root: any = hierarchy(this.dataset) // eslint-disable-line @typescript-eslint/no-explicit-any
      .sum(function (d) {
        return (Object.prototype.hasOwnProperty.call(d, 'accountable')? 1 : 0) +
          (Object.prototype.hasOwnProperty.call(d, 'helpers') ? d.helpers.length : 0) + 1;
      })
      .sort(function (a, b) {
        if (a && a.value && b && b.value) {
          return b.value - a.value;
        } else {
          return 0;
        }
      });

    this.circles = packInitiatives(root).descendants();
    this.circleMapService.setCircles(this.circles);
  }

  clearCircleStates() {
    this.circles.forEach((circle) => {
      circle.data.isSelected = false;
      circle.data.isOpened = false;
    });
  }

  identifyCircleTypes() {
    if (this.circles) {
      this.rootCircle = this.circles[0];
      this.primaryCircles = this.rootCircle.children ? this.rootCircle.children : [];
    }

    this.circles.forEach((circle) => {
      circle.data.isLeaf = circle.children ? false : true;
      circle.data.isPrimary = false;
      circle.data.isChildOfPrimary = false;
    });

    this.primaryCircles.forEach((primaryCircle) => {
      primaryCircle.data.isPrimary = true;

      primaryCircle.children?.forEach((childOfPrimaryCircle) => {
        childOfPrimaryCircle.data.isChildOfPrimary = true;
      })
    });
  }

  calculateMaxDepth() {
    let maxDepth = 0;
    this.rootCircle?.eachAfter((node): void => {
        maxDepth = maxDepth > node.depth ? maxDepth : node.depth;
    });
    return maxDepth;
  }

  assignColorsToCircles() {
    const maxDepth = this.calculateMaxDepth();
    const colorRange = this.colorService.getColorRangeNew(maxDepth, this.seedColor);

    this.circles.forEach((circle) => {
      const isPrimaryCircle = this.primaryCircles.includes(circle);
      const isChildOfPrimaryCircle = circle.parent ? this.primaryCircles.includes(circle.parent) : false;

      if (circle.data.isLeaf && !isPrimaryCircle && !isChildOfPrimaryCircle) {
        circle.data.color = '#ffffff';
      } else {
        circle.data.color = colorRange(circle.depth - 1);
      }
    });
  }

  adjustPrimaryCircleSelectionBasedOnSelectedCircle() {
    const selectedCircle = this.circleMapService.selectedCircle.value;

    if (selectedCircle) {
      this.markPrimaryCirclesAsNotSelected();

      if (this.primaryCircles.includes(selectedCircle)) {
        this.circleMapService.markCircleAsSelected(selectedCircle);
      }
    } else {
      this.markPrimaryCirclesAsSelected();
    }
  }

  toggleInfoPanelBasedOnSelectedCircle() {
    const selectedCircle = this.circleMapService.selectedCircle.value;

    if (selectedCircle) {
      this.showInfoPanelFor(selectedCircle);
    } else {
      this.hideInfoPanel();
    }
  }

  markPrimaryCirclesAsSelected() {
    this.primaryCircles.forEach(primaryCircle => {
      this.circleMapService.markCircleAsSelected(primaryCircle);
    });
  }

  markPrimaryCirclesAsNotSelected() {
    this.primaryCircles.forEach(primaryCircle => {
      this.circleMapService.markCircleAsNotSelected(primaryCircle);
    });
  }

  showInfoPanelFor(circle: InitiativeNode) {
    // this.showToolipOf$.next({ initiatives: [circle.data as unknown as Initiative], isNameOnly: false });
    console.log('TODO: show info panel...');
  }

  hideInfoPanel() {
    // this.showToolipOf$.next({ initiatives: null, isNameOnly: false });
    console.log('TODO: hide info panel...');
  }

  onBackdropClick() {
    this.circleMapService.onBackdropClick();
  }
}
