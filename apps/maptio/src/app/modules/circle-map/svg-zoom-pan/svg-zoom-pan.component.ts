import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';

import { SubSink } from 'subsink';

import { SvgZoomPanService } from './svg-zoom-pan.service';
import { InitiativeNode } from '../initiative.model';


@Component({
  selector: 'maptio-svg-zoom-pan',
  templateUrl: './svg-zoom-pan.component.html',
  styleUrls: ['./svg-zoom-pan.component.scss']
})
export class SvgZoomPanComponent implements OnInit, OnDestroy {
  @ViewChild('map') private svgElement: ElementRef;
  private svgCTM: SVGMatrix;

  private subs = new SubSink();

  scale = 1;
  translateX = 0;
  translateY = 0;
  transform = '';

  isPanning = false;
  panStartX = 0;
  panStartY = 0;
  isPanJustStopped = false;

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

  onPanStart() {
    // console.log('onPanStart');
    this.svgCTM = this.svgElement.nativeElement.getScreenCTM();
    this.isPanning = true;
    this.panStartX = this.translateX;
    this.panStartY = this.translateY;
  }

  onPan($event: HammerInput) {
    // console.log('onPan', $event.deltaX, $event.deltaY);

    this.translateX = this.panStartX + $event.deltaX / this.svgCTM.a / 10;
    this.translateY = this.panStartY + $event.deltaY / this.svgCTM.a / 10;

    this.setTransform();

    const panningThreshold = 4;
    if (Math.abs($event.deltaX) >= panningThreshold || Math.abs($event.deltaY) >= panningThreshold) {
      this.svgZoomPanService.hasPanningJustStopped = true;
    }
  }

  onPanEnd() {
    // console.log('onPanEnd');
    this.isPanning = false;
    this.svgZoomPanService.hasPanningJustStopped = true;
  }

  zoomToCircle(x: number, y: number, r: number) {
    this.scale = (1000 - 100) / (2 * r);
    this.translateX = this.scaleCoordinatesAndConvertToPercentages(500 - x);
    this.translateY = this.scaleCoordinatesAndConvertToPercentages(500 - y);
    this.setTransform();
  }

  private scaleCoordinatesAndConvertToPercentages(coordinate: number) {
    return 100 * this.scale * coordinate / 1000;
  }

  setTransform() {
    this.transform = 'translate(' + this.translateX + '%, ' + this.translateY + '%) scale(' + this.scale + ')';
  }
}
