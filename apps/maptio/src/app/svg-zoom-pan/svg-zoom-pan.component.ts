import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import { SubSink } from 'subsink';

import { SvgZoomPanService } from './svg-zoom-pan.service';
import { InitiativeNode } from '../shared/initiative.model';


@Component({
  selector: 'maptio-svg-zoom-pan',
  templateUrl: './svg-zoom-pan.component.html',
  styleUrls: ['./svg-zoom-pan.component.scss']
})
export class SvgZoomPanComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();

  scale = 1;
  translateX = 0;
  translateY = 0;

  constructor(private svgZoomPanService: SvgZoomPanService) {}

  ngOnInit() {
    this.subs.sink = this.svgZoomPanService.zoomedInitiativeNode.subscribe((node?: InitiativeNode) => {
      if (node) {
        this.zoomToCircle(node.x, node.y, node.r);
      } else {
        this.zoomToCircle(500, 500, 450);
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    console.log('Coming soon to an SVG near you!');
  }

  zoomToCircle(x: number, y: number, r: number) {
    this.scale = (1000 - 100) / (2 * r);
    this.translateX = this.scaleCoordinatesAndConvertToPercentages(500 - x);
    this.translateY = this.scaleCoordinatesAndConvertToPercentages(500 - y);
  }

  private scaleCoordinatesAndConvertToPercentages(coordinate: number) {
    return 100 * this.scale * coordinate / 1000;
  }
}
