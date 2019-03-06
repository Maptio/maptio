import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { isEmpty, intersection } from "lodash-es"
import { DeviceDetectorService } from 'ngx-device-detector';
import * as screenfull from 'screenfull';
import { select, selectAll } from "d3-selection"

export enum Browsers {
  Firefox,
  Chrome,
  Safari,
  IE,
  Edge,
  Opera,
  Unknown
}


@Injectable()
export class UIService {
  constructor(private deviceService: DeviceDetectorService) {
  }

  getCanvasXMargin() {
    return 130;
  }

  getCanvasYMargin() {
    return 111;
  }

  getCanvasWidth() {
    return (screenfull as any).isFullscreen
      ? window.outerWidth
      : document.getElementById("main")
        ? document.getElementById("main").clientWidth
        : window.screen.availWidth;
  }

  getCanvasHeight() {
    return (screenfull as any).isFullscreen
      ? window.outerHeight
      : document.getElementById("main")
        ? document.getElementById("main").clientHeight
        : window.screen.availHeight;
  }

  getCircularPath(radius: number, centerX: number, centerY: number) {
    if (radius === undefined || centerX === undefined || centerY === undefined)
      throw new Error(
        "Cannot defined circular path as a parameter is missing."
      );

    let rx = -radius;
    let ry = -radius;
    return (
      "m " +
      centerX +
      ", " +
      centerY +
      " a " +
      rx +
      "," +
      ry +
      " 1 1,1 " +
      radius * 2 +
      ",0 a -" +
      radius +
      ",-" +
      radius +
      " 1 1,1 -" +
      radius * 2 +
      ",0"
    );
  }

  public getScreenCoordinates(x: any, y: any, matrix: any) {
    var xn = matrix.e + x * matrix.a + y * matrix.c;
    var yn = matrix.f + x * matrix.b + y * matrix.d;
    return { x: xn, y: yn };
  }

  public getContextMenuCoordinates(mouse: any, matrix: any) {

    let m = document.getElementById("maptio-context-menu");

    let center = { x: window.pageXOffset, y: window.pageYOffset };
    let canvas = { width: this.getCanvasWidth(), height: this.getCanvasHeight() };
    let divider = 4; //because context-menu is col-3;
    let menu = { width: m.clientWidth, height: 350 }

    let initialPosition = {
      x: this.getScreenCoordinates(center.x + mouse.x, center.y + mouse.y, matrix).x,
      y: this.getScreenCoordinates(center.x + mouse.x, center.y + mouse.y, matrix).y
    }

    let adjustments = {
      horizontal: initialPosition.x + menu.width > canvas.width
        ? -menu.width
        : 0
      ,

      vertical: initialPosition.y + menu.height > canvas.height
        ? -canvas.height / divider
        : 0
    }

    return {
      x: initialPosition.x + adjustments.horizontal,
      y: initialPosition.y + adjustments.vertical
    }
  }

  public clean() {
    selectAll("svg")
      .selectAll("*")
      .remove();
    selectAll("div.arrow_box").remove();
  }


  public getBrowser(): Browsers {

    switch (this.deviceService.browser) {
      case "chrome":
        return Browsers.Chrome;

      case "firefox":
        return Browsers.Firefox;
      case "safari":
        return Browsers.Safari;
      case "opera":
        return Browsers.Opera;
      case "ie":
        return Browsers.IE;
      case "ms-edge":
        return Browsers.Edge;
      default:
        return Browsers.Unknown;
    }
  }

  filter(
    selectedTags: any[],
    unselectedTags: any[],
    selection: any[]
  ): boolean {
    return isEmpty(selectedTags) // all tags are unselected by default
      ? true
      : isEmpty(selection) // the circle doesnt have any tags
        ? false
        : intersection(selectedTags.map(t => t.shortid), selection).length ===
          0
          ? false
          : true;
  }

  // getCenteredMargin(isReset?: boolean): string {
  //   // console.log("getCenteredMargin")
  //   let outerSvg = document.querySelector("svg#map");
  //   let innerSvg = document.querySelector("svg#map > svg");
  //   let width = this.getCanvasWidth();
  //   let height = this.getCanvasHeight();
  //   let outer = outerSvg ? outerSvg.clientWidth : 0;
  //   let inner = innerSvg ? innerSvg.getBoundingClientRect().width : 0;

  //   return outer > inner && inner>0 ? `calc(50% - ${inner / 2}px)` : `${((width - height) / width * 100 / 2)}%`
  // }
}
