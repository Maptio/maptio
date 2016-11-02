import {Injectable, OnInit} from '@angular/core'
import { D3Service, D3,ScaleLinear, HSLColor, RGBColor} from 'd3-ng2-service'


@Injectable()
export class ColorService implements OnInit{

    d3:D3;

    FRONT_COLOR:HSLColor;
    BACK_COLOR:HSLColor;


    constructor(d3Service:D3Service){
        this.d3 = d3Service.getD3();
    }

    ngOnInit(){
        this.FRONT_COLOR = this.d3.hsl(152,0.8,0.8);
        this.BACK_COLOR = this.d3.hsl(228,0.4,0.4);
    }

    getColorRange(start:HSLColor, end:HSLColor): ScaleLinear<HSLColor, string>{
        return this.d3.scaleLinear<HSLColor, HSLColor>()
                    .domain([-1, 5])
                    .range([start, end ])
                    .interpolate(this.d3.interpolateHcl);
    }



}