import { hsl, HSLColor } from "d3-color";
import { scaleLinear, ScaleLinear } from "d3-scale";
import { interpolateRgb, interpolateHsl,interpolateHcl,  interpolateNumber } from "d3-interpolate";


export default function getColorRange(
    depth: number,
    seedColor: string
): ScaleLinear<HSLColor, string> {
    let seed = hsl(seedColor);
    let yellow = hsl(seedColor);
    yellow.h = 20;
    return scaleLinear<HSLColor, HSLColor>()
        .domain([0, depth])
        .interpolate(interpolateHcl)
        .range([seed, yellow ]);
}
