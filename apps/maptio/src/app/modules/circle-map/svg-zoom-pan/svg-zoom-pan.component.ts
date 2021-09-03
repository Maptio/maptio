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

  isPanning = false;
  panStartX = 0;
  panStartY = 0;
  isClickSideEffectOfPanning = false;

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
    // Location of cursor at the time of zoom
    const zoomCenter = this.findZoomCenter($event);

    const oldScale = this.scale;
    const relativeStep = $event.deltaY / $event.screenY;
    const newScale = this.scale - this.scale * relativeStep;

    // Prevent scaling down below a threshold
    if (newScale < 0.5) {
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
    this.translateX += (zoomScreenX - 50) * relativeStep;
    this.translateY += (zoomScreenY - 50) * relativeStep;

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

    this.setTransform();
  }

  private scaleCoordinatesAndConvertToPercentages(coordinate: number) {
    return 100 * this.scale * coordinate / 1000;
  }

  setTransform() {
    this.transform = 'translate(' + this.translateX + '%, ' + this.translateY + '%) scale(' + this.scale + ')';
  }
}
