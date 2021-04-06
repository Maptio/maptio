import {
  Component,
  OnDestroy,
  Input,
} from '@angular/core';

import { SubSink } from 'subsink';
import { hierarchy, pack } from 'd3-hierarchy';
import { hsl, HSLColor } from 'd3-color';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { interpolateHcl } from 'd3-interpolate';

import { Initiative, InitiativeNode } from '../shared/initiative.model';
import { CircleMapService } from '../shared/circle-map.service';


@Component({
  selector: 'maptio-circle-map',
  templateUrl: './circle-map.component.html',
  styleUrls: ['./circle-map.component.scss']
})
export class CircleMapComponent implements OnDestroy  {
  private subs = new SubSink();

  @Input()
  get dataset(): any { return this._dataset; } // eslint-disable-line @typescript-eslint/no-explicit-any
  set dataset(dataset: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this._dataset = dataset;

    if(dataset) {
      this.prepareLayout();
      this.identifyCircleTypes();
      this.assignColorsToCircles();
      this.onCircleSelectionAdjustPrimaryCircleSelection();
    }
  }
  private _dataset: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  circles: InitiativeNode[] = [];
  rootCircle: InitiativeNode | undefined = undefined;
  primaryCircles: InitiativeNode[] = [];

  constructor(
    private circleMapService: CircleMapService,
  ) {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  prepareLayout() {
    const diameter = 1000;
    const margin = 15;
    const PADDING_CIRCLE = 20;

    const boo = pack<Initiative>()
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

    console.log('data after running hierarchy:');
    console.log(root);

    console.log('data after running circle packing:');
    this.circles = boo(root).descendants();
    console.log(this.circles);
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
    })
  }

  getColorRange(depth: number, seedColor: string): ScaleLinear<HSLColor, string> {
    const seedColorHsl = hsl(seedColor);
    const endColorHsl = hsl(seedColor);
    endColorHsl.l = .25;
    endColorHsl.h = 0;

    return scaleLinear<HSLColor, HSLColor>()
      .domain([0, depth])
      .interpolate(interpolateHcl)
      .range([seedColorHsl, endColorHsl]);
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
    const colorRange = this.getColorRange(maxDepth, '#3599af');

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

  onCircleSelectionAdjustPrimaryCircleSelection() {
    this.subs.sink = this.circleMapService.selectedCircle.subscribe((selectedCircle?: InitiativeNode) => {
        console.log('CircleMap.onCircleSelectionAdjustPrimaryCircleSelection: ', selectedCircle?.data.name);

        if (selectedCircle && !this.primaryCircles.includes(selectedCircle)) {
          this.markPrimaryCirclesAsNotSelected();
        } else {
          this.markPrimaryCirclesAsSelected();
        }
      }
    );
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
    this.circleMapService.selectAndZoomToParentOfSelectedCircle();
  }
}
