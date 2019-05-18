import { hsl, HSLColor } from "d3-color";
import { scaleLinear, ScaleLinear } from "d3-scale";
import { interpolateRgb, interpolateHsl,interpolateHcl,  interpolateNumber } from "d3-interpolate";


export default function getColorRange(
    depth: number,
    seedColor: string
): ScaleLinear<HSLColor, string> {
    let seed = hsl(seedColor);
    let white = hsl(seedColor);
    white.l = .25;
    white.h = 0;
    return scaleLinear<HSLColor, HSLColor>()
        .domain([0, depth])
        .interpolate(interpolateHcl)
        .range([seed, white ]);
}
