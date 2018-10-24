import { Injectable, OnInit } from "@angular/core";
import {
  D3Service,
  D3,
  ScaleLinear,
  HSLColor,
  InterpolatorFactory
} from "d3-ng2-service";

@Injectable()
export class ColorService implements OnInit {
  d3: D3;

  FRONT_COLOR: HSLColor;
  BACK_COLOR: HSLColor;

  constructor(d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    this.FRONT_COLOR = this.d3.hsl(0, 0, 0.99);
    this.BACK_COLOR = this.d3.hsl(0, 0, 0.2);
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
    let seed = this.d3.hsl(seedColor);
    return this.d3
      .scaleLinear<HSLColor, HSLColor>()
      .domain([-1, depth])
      .interpolate(this.d3.interpolateRgb)
      .range([this.BACK_COLOR, seed]);
  }

  getFontSizeRange(
    depth: number,
    maxFontSize: number
  ): ScaleLinear<number, number> {
    let slowInterpolator = function(a: number, b: number) {
      return function(t: number) {
        // console.log(
        //   `t=${t}`,
        //   `y=${Math.max(a, b) - Math.exp(t / Math.max(a, b) * 100)}`
        // );
        let E = Math.max(a, b);
        return E * (1 - Math.exp((t - 1) * E / 2));
      };
    };
    this.d3.interpolateNumber;
    return this.d3
      .scaleLinear<number, number>()
      .domain([-1, depth])
      .interpolate(this.d3.interpolateNumber)
      .range([maxFontSize, maxFontSize * 0.75]);
  }
}
