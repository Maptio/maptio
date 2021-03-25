import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { SubSink } from 'subsink';
import { hierarchy, pack, HierarchyCircularNode } from 'd3-hierarchy';

import * as svgPanZoom from 'svg-pan-zoom';
import 'hammerjs';

import { CircleMapService } from '../shared/circle-map.service';
import { CircleState } from '../shared/circle-state.enum';
import { Initiative } from '../shared/initiative.model';

import data from '../markhof.data.json';

@Component({
  selector: 'maptio-circle-map',
  templateUrl: './circle-map.component.html',
  styleUrls: ['./circle-map.component.scss']
})
export class CircleMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('map', { static: false }) map?: ElementRef;

  private subs = new SubSink();

  scheme?: SvgPanZoom.Instance;

  isCircleSelected = true;

  circles: HierarchyCircularNode<Initiative>[] = [];
  rootCircle: HierarchyCircularNode<Initiative> | undefined = undefined;
  selectedCircle: HierarchyCircularNode<Initiative> | undefined = undefined;
  lastLeftCircle: HierarchyCircularNode<Initiative> | undefined = undefined;
  currentlyHoveredCircle: HierarchyCircularNode<Initiative> | undefined = undefined;

  constructor(private circleMapService: CircleMapService) {
  }

  ngOnInit(): void {
    this.prepareLayout();

    // this.circles.forEach((circle) => {
    //   circle.data.state = CircleState.hidden;
    // });

    if (this.circles) {
      this.rootCircle = this.circles[0];
    }

    console.log('Selected circle');
    console.log(this.selectedCircle);

    this.setCircleTypes();

    this.subs.sink = this.circleMapService.selectedCircle.subscribe(
      (selectedCircle?: HierarchyCircularNode<Initiative>) => {
        console.log('Got selected circle in the map component:');
        console.log(selectedCircle);

        if (selectedCircle) {
          if (this.selectedCircle) {
            this.selectedCircle.data.isSelected = false;
          }

          this.rootCircle?.children?.forEach(primaryCircle => {
            primaryCircle.data.isSelected = false;
          });

          this.isCircleSelected = true;

          this.selectedCircle = selectedCircle;
          this.selectedCircle.data.isSelected = true;
        } else {
          this.isCircleSelected = false;

          this.rootCircle?.children?.forEach(primaryCircle => {
            primaryCircle.data.isSelected = true;
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.initialiseZoomAndPanLibrary();

    // setTimeout(() => {
    //   this.selectCircle(this.circles[1])
    // });
  }

  prepareLayout() {
    console.log(data);
    console.log(pack);

    const diameter = 1000;
    const margin = 15;
    const PADDING_CIRCLE = 20;

    const boo = pack<Initiative>()
      .size([diameter - margin, diameter - margin])
      .padding(function () { // eslint-disable-line @typescript-eslint/no-explicit-any
        return PADDING_CIRCLE;
      });

    console.log('data before running hierarchy:');
    console.log(data);

    const root: any = hierarchy(data) // eslint-disable-line @typescript-eslint/no-explicit-any
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

  setCircleTypes() {
    this.circles.forEach((circle) => {
      circle.data.isLeaf = circle.children ? false : true;
      circle.data.isRoot = false;
      circle.data.isPrimary = false;
      circle.data.isSecondary = false;
    });

    this.circles[0].data.isRoot = true;

    this.circles[0].children?.forEach(primaryCircle => {
      primaryCircle.data.isPrimary = true;

      primaryCircle.children?.forEach(secondaryCircle => {
        secondaryCircle.data.isSecondary = true;
      });
    });
  }

















  getCircleId(circleIndex: number) {
    return 'maptio-circle-' + circleIndex;
  }

  getCircleState(circle: HierarchyCircularNode<Initiative>): CircleState | undefined {
    return circle.data.state;
  }

  setCircleState(circle: HierarchyCircularNode<Initiative>, state: CircleState) {
    circle.data.state = state;
    console.log(`Setting state of "${circle.data.name}" to "${state}"`);
  }

  setCircleStateForChildren(circle: HierarchyCircularNode<Initiative>, state: CircleState) {
    circle.children?.forEach(childCircle => {
      this.setCircleState(childCircle, state);
    })
  }

  selectCircle(circle: HierarchyCircularNode<Initiative>) {
    if (this.selectedCircle) {
      this.setCircleState(this.selectedCircle, CircleState.hidden);
      this.setCircleStateForChildren(this.selectedCircle, CircleState.hidden);
    }

    this.selectedCircle = circle;
    this.setCircleState(circle, CircleState.selected);
    this.setCircleStateForChildren(circle, CircleState.childOfSelected);
  }

  deselectSelectedCircle() {
    console.log('DESELECTING!');
    if (this.selectedCircle) {
      this.setCircleState(this.selectedCircle, CircleState.hidden);
      this.setCircleStateForChildren(this.selectedCircle, CircleState.hidden);
      this.selectedCircle = undefined;
    }

    // this.selectCircle(this.circles[1]);
  }

  hoverOverSelectedCircle(circle: HierarchyCircularNode<Initiative>) {
    this.setCircleState(circle, CircleState.selectedAndHovered);
    this.setCircleStateForChildren(circle, CircleState.childOfSelectedAndHovered);
  }

  stopHoveringOverSelectedCircle(circle: HierarchyCircularNode<Initiative>) {
    this.setCircleState(circle, CircleState.selected);
    this.setCircleStateForChildren(circle, CircleState.childOfSelected);
  }

  highlightChildOfSelectedCircle(circle: HierarchyCircularNode<Initiative>) {
    if (this.selectedCircle) {
      this.setCircleStateForChildren(this.selectedCircle, CircleState.childOfSelected);
      // this.setCircleState(this.selectedCircle, CircleState.selectedAndHovered);
    } else {
      console.error('highlightChildOfSelectedCircle() should never have been called without a selected circle!');
    }

    this.setCircleState(circle, CircleState.highlightedChildOfSelectedAndHovered);
  }

  onCircleMouseEnter(circle: HierarchyCircularNode<Initiative>) {
    console.log('Entering...', circle.data.name);
    this.currentlyHoveredCircle = circle;

    if (this.lastLeftCircle && circle.parent === this.lastLeftCircle) {
      this.hoverOverSelectedCircle(this.lastLeftCircle);
    }

    const circleState = this.getCircleState(circle);
    switch (circleState) {
      case CircleState.selected:
        this.hoverOverSelectedCircle(circle)
        break;

      case CircleState.childOfSelectedAndHovered:
        this.highlightChildOfSelectedCircle(circle);
        break;

      case CircleState.selectedAndHovered:
        this.hoverOverSelectedCircle(circle);
        break;

      default:
        break;
    }
  }

  onCircleMouseLeave(circle: HierarchyCircularNode<Initiative>) {
    console.log('Leaving...', circle.data.name);

    this.lastLeftCircle = circle;
    this.currentlyHoveredCircle = undefined;

    const circleState = this.getCircleState(circle);

    if (circleState === CircleState.selectedAndHovered) {
      this.stopHoveringOverSelectedCircle(circle)
    }
  }

  onCircleClick(circle: HierarchyCircularNode<Initiative>, circleIndex: number) {
    // const circleId = this.getCircleId(circleIndex);
    // this.zoomToCircle(circleId);
    console.log(circle, circleIndex);
    // this.selectCircle(circle);

    const circleState = this.getCircleState(circle);
    switch (circleState) {
      case CircleState.highlightedChildOfSelectedAndHovered:
        this.selectCircle(circle);
        this.hoverOverSelectedCircle(circle)
        break;

      case CircleState.selectedAndHovered:
      case CircleState.selected:
        this.deselectSelectedCircle();
        break;

      default:
        break;
    }
  }

  onBackdropClick() {
    console.log('ON BACKDROP CLICK!!!');
    this.deselectSelectedCircle();
  }
}
