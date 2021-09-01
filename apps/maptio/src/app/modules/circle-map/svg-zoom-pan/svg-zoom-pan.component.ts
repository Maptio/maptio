import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
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

  transform = '';
  private scale = 1;
  private translateX = 0; // %
  private translateY = 0; // %

  transformOrigin = '';
  private transformOriginX = 50; // %
  private transformOriginY = 50; // %

  isPanning = false;
  panStartX = 0;
  panStartY = 0;
  isClickSideEffectOfPanning = false;

  lastTranslateX = 0;
  lastTranslateY = 0;

  zoomCenter?: SVGPoint;
  lastZoomCenter?: SVGPoint;
  lastTransformOriginX = 50; // %
  lastTransformOriginY = 50; // %

  lastZoomEvent?: WheelEvent;

  constructor(
    private svgZoomPanService: SvgZoomPanService,
    private changeDetector: ChangeDetectorRef,
  ) {}

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
    this.svgCTM = this.refreshScreenCTM();
    this.panStartX = this.translateX;
    this.panStartY = this.translateY;
  }

  onPan($event: HammerInput) {
    if (!this.svgCTM) {
      return;
    }

    this.translateX = this.panStartX + $event.deltaX / this.svgCTM.a / 10;
    this.translateY = this.panStartY + $event.deltaY / this.svgCTM.a / 10;

    this.setTransform();

    const panningThreshold = 3;
    if (Math.abs($event.deltaX) >= panningThreshold || Math.abs($event.deltaY) >= panningThreshold) {
      this.isPanning = true;
      this.isClickSideEffectOfPanning = true;
    }
  }

  onPanEnd() {
    this.isPanning = false;

    // In case click after panning doesn't get immediately caught by wrapper
    // (e.g. when pointer moves onto browser UI at the end of pan), make sure
    // we reset treating clicks as coming from panning events
    setTimeout(() => {
      this.isClickSideEffectOfPanning = false;
    });
  }

  // This is used for capturing clicks that happen at the end of the pan event
  // as a bit of a nasty side effect
  onWrapperClick($event: PointerEvent) {
    if (this.isClickSideEffectOfPanning) {
      $event.stopPropagation();
      this.isClickSideEffectOfPanning = false;
    }
  }

  onWheel($event: WheelEvent) {
    this.zoomCenter = this.findZoomCenter($event);

    const oldScale = this.scale;
    const relativeStep = $event.deltaY / $event.screenY;
    const scaleChange = this.scale * relativeStep;
    this.scale -= scaleChange;

    // Location of cursor at the time of zoom relative to the center of the
    // visible part of the SVG (in percentage of SVG size)
    const zoomScreenX = this.zoomCenter.x / 10; // %
    const zoomScreenY = this.zoomCenter.y / 10; // %

    this.translateX = this.translateX / oldScale * this.scale + (zoomScreenX - 50) * relativeStep;
    this.translateY = this.translateY / oldScale * this.scale + (zoomScreenY - 50) * relativeStep;

    this.setTransform();
  }

  private refreshScreenCTM() {
    return this.svgElement.nativeElement.getScreenCTM();
  }

  private findZoomCenter($event: WheelEvent) {
    this.svgCTM = this.refreshScreenCTM();

    const zoomCenterInDomCoordinates = this.svgElement.nativeElement.createSVGPoint();
    zoomCenterInDomCoordinates.x = $event.clientX;
    zoomCenterInDomCoordinates.y = $event.clientY;

    return zoomCenterInDomCoordinates.matrixTransform(
      this.svgCTM.inverse()
    );
  }

  zoomToCircle(x: number, y: number, r: number) {
    this.scale = (1000 - 100) / (2 * r);
    this.translateX = this.scaleCoordinatesAndConvertToPercentages(500 - x);
    this.translateY = this.scaleCoordinatesAndConvertToPercentages(500 - y);

    this.transformOriginX = 50;
    this.transformOriginY = 50;
    this.lastTransformOriginX = 50;
    this.lastTransformOriginY = 50;
    this.lastZoomEvent = undefined;
    this.lastZoomCenter = undefined;
    this.setTransform();
  }

  private scaleCoordinatesAndConvertToPercentages(coordinate: number) {
    return 100 * this.scale * coordinate / 1000;
  }

  setTransform() {
    this.transform = 'translate(' + this.translateX + '%, ' + this.translateY + '%) scale(' + this.scale + ')';
    this.transformOrigin = `${this.transformOriginX}% ${this.transformOriginY}%`
  }
}
