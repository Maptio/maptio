import { Injectable, OnInit } from "@angular/core"
import { D3Service, D3, ScaleLinear, HSLColor } from "d3-ng2-service"


@Injectable()
export class ColorService implements OnInit {

    d3: D3;

    FRONT_COLOR: HSLColor;
    BACK_COLOR: HSLColor;


    constructor(d3Service: D3Service) {
        this.d3 = d3Service.getD3();
        this.FRONT_COLOR = this.d3.hsl(0, 0, 0.99);
        this.BACK_COLOR = this.d3.hsl(204, 0.64, 0.44);
    }

    ngOnInit() {
    }

    getColorRange(start: HSLColor, end: HSLColor): ScaleLinear<HSLColor, string> {
        return this.d3.scaleLinear<HSLColor, HSLColor>()
            .domain([-1, 10])
            .range([start, end])
            .interpolate(this.d3.interpolateHsl);
    }

    getDefaulColorRange(depth: number): ScaleLinear<HSLColor, string> {
        return this.d3.scaleLinear<HSLColor, HSLColor>()
            .domain([-1, depth])
            .interpolate(this.d3.interpolateHcl)
            .range([this.FRONT_COLOR, this.BACK_COLOR])

    }

}