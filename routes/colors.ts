import { hsl, HSLColor } from "d3-color";
import { scaleLinear, ScaleLinear } from "d3-scale";
import { interpolateRgb, interpolateHsl, interpolateNumber } from "d3-interpolate";


export default function getColorRange(
    depth: number,
    seedColor: string
): ScaleLinear<HSLColor, string> {
    let seed = hsl(seedColor);
    return scaleLinear<HSLColor, HSLColor>()
        .domain([-1, depth])
        .interpolate(interpolateHsl)
        .range([seed, hsl(255, 0.5, 0.5, 1) ]);


}
