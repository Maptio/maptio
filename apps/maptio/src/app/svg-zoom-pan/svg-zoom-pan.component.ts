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
    this.subs.sink = this.svgZoomPanService.zoomedInitiativeNode.subscribe((node: InitiativeNode) => {
      this.zoomToCircle(node.x, node.y, node.r);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    console.log('Coming soon to an SVG near you!');
  }

  zoomToCircle(x: number, y: number, r: number) {
    console.log(x, y, r);

    this.scale = (1000 - 100) / (2 * r);
    this.translateX = -x + 500;
    this.translateY = -y + 500;

    setTimeout(() => {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
    }, 2000)
  }
}
