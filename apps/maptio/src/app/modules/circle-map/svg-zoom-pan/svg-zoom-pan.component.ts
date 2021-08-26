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
  }

  onPan($event: HammerInput) {
    // console.log('onPan', $event.deltaX, $event.deltaY);

    this.translateX = $event.deltaX / this.svgCTM.a / 10;
    this.translateY = $event.deltaY / this.svgCTM.a / 10;

    // console.log(this.translateX, this.translateY);
    this.setTransform();
  }

  onPanEnd() {
    // console.log('onPanEnd');
    this.isPanning = false;
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
