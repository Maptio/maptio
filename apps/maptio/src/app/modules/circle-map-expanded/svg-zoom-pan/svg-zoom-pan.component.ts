import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';

import { SubSink } from 'subsink';

import { SvgZoomPanService } from './svg-zoom-pan.service';
import { InitiativeNode } from '../initiative.model';

@Component({
  selector: 'maptio-svg-zoom-pan',
  templateUrl: './svg-zoom-pan.component.html',
  styleUrls: ['./svg-zoom-pan.component.scss'],
})
export class SvgZoomPanComponent implements OnInit, OnDestroy {
  @ViewChild('map') private svgElement: ElementRef;
  private svgCTM: SVGMatrix;

  private subs = new SubSink();

  transform = '';
  private scale = 1;
  private translateX = 0; // %
  private translateY = 0; // %

  isPanning = false;
  panStartX = 0;
  panStartY = 0;
  isClickSideEffectOfPanning = false;

  pinchStartX = 0;
  pinchStartY = 0;
  pinchStartScale = 1;
  lastRelativePinchScale = 1;
  isPanSideEffectOfPinching = false;

  constructor(
    private svgZoomPanService: SvgZoomPanService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subs.sink = this.svgZoomPanService.zoomedInitiativeNode.subscribe(
      (node?: InitiativeNode) => {
        if (node) {
          this.zoomToCircle(node.x, node.y, node.r);
        } else {
          this.zoomToCircle(500, 500, 450);
        }
      }
    );

    this.subs.sink = this.svgZoomPanService.zoomScaleFactor.subscribe(
      (scaleChange: number) => {
        if (scaleChange) {
          this.onZoomButtonPress(scaleChange);
        }
      }
    );
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

    // When pan event is fired at the end of pinching, don't move but still
    // execute the rest of the code to prevent the click that comes at the end
    // of panning from firing too, not pretty
    if (!this.isPanSideEffectOfPinching) {
      this.translateX = this.panStartX + $event.deltaX / this.svgCTM.a / 10;
      this.translateY = this.panStartY + $event.deltaY / this.svgCTM.a / 10;

      this.setTransform();
    }

    const panningThreshold = 3;
    if (
      Math.abs($event.deltaX) >= panningThreshold ||
      Math.abs($event.deltaY) >= panningThreshold
    ) {
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
    }, 100);
  }

  // This is used for capturing clicks that happen at the end of the pan event
  // as a bit of a nasty side effect
  onWrapperClick($event: PointerEvent) {
    if (this.isClickSideEffectOfPanning) {
      $event.stopPropagation();
      this.isClickSideEffectOfPanning = false;
    }
  }

  onZoomButtonPress(scaleChange: number) {
    this.zoomAroundCentreByFactor(scaleChange);
  }

  onWheel($event: WheelEvent) {
    this.zoomAroundPoint(
      $event.clientX,
      $event.clientY,
      ($event.deltaY / $event.screenY) * 2
    );
    $event.preventDefault();
  }

  onPinchStart() {
    this.svgCTM = this.refreshScreenCTM();
    this.isPanning = true;
    this.lastRelativePinchScale = 1;
    this.pinchStartScale = this.scale;
    this.pinchStartX = this.translateX;
    this.pinchStartY = this.translateY;
    this.isPanSideEffectOfPinching = true;
  }

  onPinch($event: TouchInput) {
    const stepSize = this.lastRelativePinchScale - $event.scale;
    this.lastRelativePinchScale = $event.scale;
    this.zoomAndMove(
      $event.center.x,
      $event.center.y,
      $event.deltaX,
      $event.deltaY,
      stepSize
    );
  }

  onPinchEnd() {
    this.isPanning = false;

    setTimeout(() => {
      this.isPanSideEffectOfPinching = false;
    }, 100);
  }

  private zoomAroundCentreByFactor(scaleFactor: number) {
    const oldScale = this.scale;
    const newScale = this.scale * scaleFactor;
    const stepSize = scaleFactor - 1;

    // Prevent scaling down below a threshold
    if (newScale < 0.25 || newScale > 100) {
      return;
    }

    this.scale = newScale;

    // Location of cursor at the time of zoom relative to the center of the
    // visible part of the SVG (in percentage of SVG size)
    const zoomScreenX = 50; // %
    const zoomScreenY = 50; // %

    // Translate values are scaled and so when the scale changes we need to
    // rescale them
    this.translateX *= this.scale / oldScale;
    this.translateY *= this.scale / oldScale;

    // Push center of the SVG away from the cursor by an amount that guarantees
    // that the cursor will stay above the same point within the SVG
    this.translateX += (zoomScreenX - 50) * stepSize;
    this.translateY += (zoomScreenY - 50) * stepSize;

    this.setTransform();
    this.changeDetector.markForCheck();
  }

  private zoomAroundPoint(centerX: number, centerY: number, stepSize: number) {
    // Location of cursor at the time of zoom
    const zoomCenter = this.convertZoomCenterToSVGCoordinates(centerX, centerY);

    const oldScale = this.scale;
    const newScale = this.scale - this.scale * stepSize;

    // Prevent scaling down beyond a threshold
    if (newScale < 0.5 || newScale > 100) {
      return;
    }

    this.scale = newScale;

    // Location of cursor at the time of zoom relative to the center of the
    // visible part of the SVG (in percentage of SVG size)
    const zoomScreenX = zoomCenter.x / 10; // %
    const zoomScreenY = zoomCenter.y / 10; // %

    // Translate values are scaled and so when the scale changes we need to
    // rescale them
    this.translateX *= this.scale / oldScale;
    this.translateY *= this.scale / oldScale;

    // Push center of the SVG away from the cursor by an amount that guarantees
    // that the cursor will stay above the same point within the SVG
    this.translateX += (zoomScreenX - 50) * stepSize;
    this.translateY += (zoomScreenY - 50) * stepSize;

    this.setTransform();
  }

  private zoomAndMove(
    centerX: number,
    centerY: number,
    deltaX: number,
    deltaY: number,
    stepSize: number
  ) {
    if (!this.svgCTM) {
      return;
    }

    // Location of cursor at the time of zoom
    const zoomCenter = this.convertZoomCenterToSVGCoordinates(centerX, centerY);

    const newScale = this.scale - this.scale * stepSize;

    // Prevent scaling down below a threshold
    if (newScale < 0.5 || newScale > 100) {
      return;
    }

    this.scale = newScale;

    // Location of cursor at the time of zoom relative to the center of the
    // visible part of the SVG (in percentage of SVG size)
    const zoomScreenX = zoomCenter.x / 10; // %
    const zoomScreenY = zoomCenter.y / 10; // %

    // Translate values are scaled and so when the scale changes we need to
    // rescale them
    const pinchStartXRescaled =
      (this.pinchStartX * this.scale) / this.pinchStartScale;
    const pinchStartYRescaled =
      (this.pinchStartY * this.scale) / this.pinchStartScale;

    this.translateX = pinchStartXRescaled + deltaX / this.svgCTM.a / 10;
    this.translateY = pinchStartYRescaled + deltaY / this.svgCTM.a / 10;

    // Push center of the SVG away from the cursor by an amount that guarantees
    // that the cursor will stay above the same point within the SVG
    this.translateX += (zoomScreenX - 50) * stepSize;
    this.translateY += (zoomScreenY - 50) * stepSize;

    this.setTransform();
  }

  private refreshScreenCTM() {
    return this.svgElement.nativeElement.getScreenCTM();
  }

  private convertZoomCenterToSVGCoordinates(clientX: number, clientY: number) {
    this.svgCTM = this.refreshScreenCTM();

    const zoomCenterInDomCoordinates = this.svgElement.nativeElement.createSVGPoint();
    zoomCenterInDomCoordinates.x = clientX;
    zoomCenterInDomCoordinates.y = clientY;

    return zoomCenterInDomCoordinates.matrixTransform(this.svgCTM.inverse());
  }

  zoomToCircle(x: number, y: number, r: number) {
    this.scale = (1000 - 100) / (2 * r);
    this.translateX = this.scaleCoordinatesAndConvertToPercentages(500 - x);
    this.translateY = this.scaleCoordinatesAndConvertToPercentages(500 - y);

    this.setTransform();
  }

  private scaleCoordinatesAndConvertToPercentages(coordinate: number) {
    return (100 * this.scale * coordinate) / 1000;
  }

  setTransform() {
    this.transform =
      'translate(' +
      this.translateX +
      '%, ' +
      this.translateY +
      '%) scale(' +
      this.scale +
      ')';
  }
}
