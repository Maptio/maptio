import { Injectable, OnInit } from '@angular/core';
import { hsl, HSLColor } from 'd3-color';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import {
  interpolateRgb,
  interpolateHcl,
  interpolateNumber,
} from 'd3-interpolate';

@Injectable()
export class ColorService implements OnInit {
  FRONT_COLOR: HSLColor;
  BACK_COLOR: HSLColor;

  constructor() {
    this.FRONT_COLOR = hsl(0, 0, 0.99);
    this.BACK_COLOR = hsl(0, 0, 0.2);
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
  ): ScaleLinear<HSLColor, string> {
    let seed = hsl(seedColor);
    return scaleLinear<HSLColor, HSLColor>()
      .domain([-1, depth])
      .interpolate(interpolateRgb)
      .range([this.BACK_COLOR, seed]);
  }

  getColorRangeNew(
    depth: number,
    seedColor: string
  ): ScaleLinear<HSLColor, string> {
    const seedColorHsl = hsl(seedColor);
    const endColorHsl = hsl(seedColor);
    endColorHsl.l = 0.25;
    endColorHsl.h = 0;

    return scaleLinear<HSLColor, string>()
      .domain([0, depth])
      .interpolate(interpolateHcl)
      .range([seedColorHsl, endColorHsl]);
  }

  getFontSizeRange(
    depth: number,
    maxFontSize: number
  ): ScaleLinear<number, number> {
    let slowInterpolator = function (a: number, b: number) {
      return function (t: number) {
        let E = Math.max(a, b);
        return E * (1 - Math.exp(((t - 1) * E) / 2));
      };
    };
    return scaleLinear<number, number>()
      .domain([-1, depth])
      .interpolate(interpolateNumber)
      .range([maxFontSize, maxFontSize * 0.75]);
  }
}
