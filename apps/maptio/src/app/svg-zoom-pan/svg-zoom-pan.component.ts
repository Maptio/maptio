import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import * as svgPanZoom from 'svg-pan-zoom';
import 'hammerjs';


@Component({
  selector: 'maptio-svg-zoom-pan',
  templateUrl: './svg-zoom-pan.component.html',
  styleUrls: ['./svg-zoom-pan.component.scss']
})
export class SvgZoomPanComponent implements AfterViewInit {
  @ViewChild('map', { static: false }) map?: ElementRef;

  scheme?: SvgPanZoom.Instance;

  ngAfterViewInit() {
    this.initialiseZoomAndPanLibrary();
  }

  initialiseZoomAndPanLibrary() {
    // const SUPPORT_POINTER_EVENTS = true;

    const hammer = new Hammer(this.map?.nativeElement, {
      // inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
      inputClass: Hammer.TouchInput
    });

    console.log(hammer);

    const eventsHandler = {
      // hammer,
      haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],

      init: function(options: SvgPanZoom.CustomEventOptions) {
        console.log(options);
        const instance = options.instance;
        let initialScale = 1;
        let pannedX = 0;
        let pannedY = 0;

        // Init Hammer
        // Listen only for pointer and touch events

        // Enable pinch
        hammer.get('pinch').set({enable: true})

        // Handle double tap
        hammer.on('doubletap', function(){
          instance.zoomIn()
        })

        // Handle pan
        hammer.on('panstart panmove', function(ev){
          // On pan start reset panned variables
          if (ev.type === 'panstart') {
            pannedX = 0
            pannedY = 0
          }

          // Pan only the difference
          instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY})
          pannedX = ev.deltaX
          pannedY = ev.deltaY
        })

        // Handle pinch
        hammer.on('pinchstart pinchmove', function(ev){
          // On pinch start remember initial zoom
          if (ev.type === 'pinchstart') {
            initialScale = instance.getZoom()
            instance.zoomAtPoint(initialScale * ev.scale, {x: ev.center.x, y: ev.center.y})
          }

          instance.zoomAtPoint(initialScale * ev.scale, {x: ev.center.x, y: ev.center.y})
        })

        // Prevent moving the page on some devices when panning over SVG
        options.svgElement.addEventListener('touchmove', function(e){ e.preventDefault(); });
      },

      destroy: function() {
        console.log('destroy');
        // TODO: Move to ngOnDestroy...
        // this.hammer.destroy()
      }
    }

    console.log(this.map);

    const options = {
      zoomEnabled: true,
      controlIconsEnabled: false,
      fit: true,
      center: true,
      customEventsHandler: eventsHandler,
    };

    this.scheme = svgPanZoom.default(this.map?.nativeElement, options);
    // svgPanZoom()

    // this.scheme.zoomAtPoint(20, {x: 288, y: 183})
    // this.scheme.zoomAtPoint(1, {x: 948, y: 492})
    // this.zoomToCircle();
  }

  zoomToCircle(circleId: string) {
    this.scheme?.reset();

    //REM: Apparently the values need some times to adjust after reset() is called, yet is seems to have no callback.
    setTimeout(() => {
        const tViewport: SVGAElement | null = document.querySelector('g.svg-pan-zoom_viewport');
        const circle: SVGAElement | null = document.querySelector(`#${circleId}`);
        const tBBox = circle?.getBBox();
        const viewportBoundingBox = tViewport?.getBBox();

        if (tViewport && tBBox && viewportBoundingBox) {
          // const style = window.getComputedStyle(tViewport)
          // console.log(tViewport);
          // console.log(style.transform);
          // console.log(style.transform);
          const tMatrix = tViewport.transform.baseVal.getItem(0).matrix;
          console.log(viewportBoundingBox);
          console.log(tBBox);
          // console.log(tViewport.transform.baseVal.consolidate().matrix);
          // const tBBox = document.getElementById(id)?.getBBox();
          const tPoint = {
            x: (tBBox.x + tBBox.width / 2) * tMatrix.a + tMatrix.e,
            y: (tBBox.y + tBBox.height / 2) * tMatrix.d + tMatrix.f
          }

          const scale = viewportBoundingBox.height / tBBox.height / 2;

          // //REM: Approximate values, I leave the exact calculation up to you.
          this.scheme?.zoomAtPoint(scale, tPoint);
        }

    }, 500);
  }
}
