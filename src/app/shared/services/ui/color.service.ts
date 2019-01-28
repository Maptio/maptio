import { Injectable, OnInit } from "@angular/core";
import * as d3 from "d3";

@Injectable()
export class ColorService implements OnInit {

  FRONT_COLOR: d3.HSLColor;
  BACK_COLOR: d3.HSLColor;

  constructor() {
    this.FRONT_COLOR = d3.hsl(0, 0, 0.99);
    this.BACK_COLOR = d3.hsl(0, 0, 0.2);
  }

  ngOnInit() {}

  // getColorRange(start: HSLColor, end: HSLColor): ScaleLinear<HSLColor, string> {
  //     return this.d3.scaleLinear<HSLColor, HSLColor>()
  //         .domain([-1, 10])
  //         .range([start, end])
  //         .interpolate(this.d3.interpolateHsl);
  // }

  // getDefaulColorRange(depth: number): ScaleLinear<HSLColor, string> {
  //   return this.d3
  //     .scaleLinear<HSLColor, HSLColor>()
  //     .domain([-1, depth])
  //     .interpolate(this.d3.interpolateHcl)
  //     .range([this.FRONT_COLOR, this.BACK_COLOR]);
  // }

  getColorRange(
    depth: number,
    seedColor: string
  ): d3.ScaleLinear<d3.HSLColor, string> {
    let seed = d3.hsl(seedColor);
    return d3
      .scaleLinear<d3.HSLColor, d3.HSLColor>()
      .domain([-1, depth])
      .interpolate(d3.interpolateRgb)
      .range([this.BACK_COLOR, seed]);
  }

  getFontSizeRange(
    depth: number,
    maxFontSize: number
  ): d3.ScaleLinear<number, number> {
    let slowInterpolator = function(a: number, b: number) {
      return function(t: number) {
        let E = Math.max(a, b);
        return E * (1 - Math.exp((t - 1) * E / 2));
      };
    };
    d3.interpolateNumber;
    return d3
      .scaleLinear<number, number>()
      .domain([-1, depth])
      .interpolate(d3.interpolateNumber)
      .range([maxFontSize, maxFontSize * 0.75]);
  }
}
