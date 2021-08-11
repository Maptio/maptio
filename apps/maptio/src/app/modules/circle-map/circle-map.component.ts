import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { SubSink } from 'subsink';
import { hierarchy, HierarchyNode, pack } from 'd3-hierarchy';
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";

import { CircleMapData } from "@maptio-shared/model/circle-map-data.interface";
import { DataSet } from "@maptio-shared/model/dataset.data";
import { Initiative } from "@maptio-shared/model/initiative.data";
import { ColorService } from "@maptio-shared/services/color/color.service";

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
  // All the data comes in as a single package
  @Input() circleMapData$: BehaviorSubject<CircleMapData>;

  // We then extract the individual pieces of the data package
  private rootInitiative: Initiative;
  private dataset: DataSet;
  private datasetId: string;
  private seedColor: string;

  // Then, the data is transformed into a display format
  circles: InitiativeNode[] = [];
  rootCircle: InitiativeNode | undefined = undefined;
  primaryCircles: InitiativeNode[] = [];

  isLoading: boolean;
  isFirstLoad = true;

  public analytics: Angulartics2Mixpanel;
  private subs = new SubSink();

  constructor(
    public colorService: ColorService,
    private cd: ChangeDetectorRef,
    private circleMapService: CircleMapService,
  ) {}

  ngOnInit() {
    this.onInputChanges();

    this.subs.sink = this.circleMapData$.subscribe(
      () => {
        this.onInputChanges();
      }
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onInputChanges() {
    if (!this.circleMapData$?.value) {
      return;
    }

    this.rootInitiative = this.circleMapData$.value.rootInitiative;
    this.dataset = this.circleMapData$.value.dataset;
    this.datasetId = this.circleMapData$.value.dataset.datasetId;
    this.seedColor = this.circleMapData$.value.seedColor;
    this.isLoading = true;

    this.circleMapService.setDataset(this.datasetId, this.dataset);

    this.prepareLayout();
    this.circleMapService.clearCircleStates();
    this.identifyCircleTypes();
    this.assignColorsToCircles();

    const lastSelectedCircle = this.circleMapService.getLastSelectedCircle(this.circles);

    if(this.isFirstLoad) {
      this.circleMapService.resetZoom();
      this.subs.sink = this.circleMapService.selectedCircle.subscribe(() => {
        this.adjustPrimaryCircleSelectionBasedOnSelectedCircle();
        this.cd.markForCheck();
      });

      this.isFirstLoad = false;
      this.isLoading = false;
    } else {
      // Trigger this method not just when a circle is selected but also any time data is updated
      this.adjustPrimaryCircleSelectionBasedOnSelectedCircle();
    }

    if(lastSelectedCircle) {
      this.circleMapService.selectCircle(lastSelectedCircle);
      this.circleMapService.zoomToCircle(lastSelectedCircle);
    }

    this.cd.markForCheck();
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

    function propagateSizeAdjustment(node: HierarchyNode<Initiative>) {
      if (node.children && node.data.computedSizeAdjustment) {
        node.children.forEach((child) => {
          child.data.computedSizeAdjustment += node.data.computedSizeAdjustment / node.children.length
        });
      }
    }

    const root: any = hierarchy(this.rootInitiative); // eslint-disable-line @typescript-eslint/no-explicit-any

    root.each((node) => { node.data.computedSizeAdjustment = node.data.sizeAdjustment ?? 0 });
    root.each(propagateSizeAdjustment);

    root
      .sum(function (d) {
        const accountableContribution = (Object.prototype.hasOwnProperty.call(d, 'accountable')? 1 : 0);
        const helpersContribution = (Object.prototype.hasOwnProperty.call(d, 'helpers') ? d.helpers.length : 0);
        const sizeAdjustmentContribution = d.computedSizeAdjustment ? Number(d.computedSizeAdjustment) : 0;
        const size = accountableContribution + helpersContribution + sizeAdjustmentContribution + 1;
        console.log(`Name: "${d.name}, user adjustment:  "${d.sizeAdjustment}", computed adjustment: "${d.computedSizeAdjustment}", final: "${size}"`);
        return size;
      })
      .sort(function (a, b) {
        if (a && a.value && b && b.value) {
          // console.log(b.value - a.value);
          return b.value - a.value;
        } else {
          return 0;
        }
      });


    console.log('Root node (with children):', root);
    console.log('\nFinal size values:');
    root.each((d) => {
      console.log(`Name: "${d.data.name}, final value: "${d.value}"`);
    });
    // console.log('root.value', root.value);

    this.circles = packInitiatives(root).descendants();
    this.circleMapService.setCircles(this.circles);
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

  onBackdropClick() {
    this.circleMapService.onBackdropClick();
  }
}
