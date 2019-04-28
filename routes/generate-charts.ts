import * as fs from "fs";
import * as path from "path"
import { transition } from "d3-transition";
import { select, selectAll, event, mouse } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { scaleLog, ScaleLogarithmic } from "d3-scale";
import { HierarchyCircularNode, pack, hierarchy } from "d3-hierarchy";
import { min } from "d3-array";
import { color } from "d3-color";

import getColorRange from "./colors"
import getCircularPath from "./paths"

const d3 = Object.assign(
    {},
    {
        transition,
        select,
        selectAll,
        mouse,
        min,
        zoom,
        zoomIdentity,
        scaleLog,
        pack,
        hierarchy,
        color,
        getEvent() { return require("d3-selection").event }
    }
)
import * as jsdom from 'jsdom';

const start = Date.now();

// const data = JSON.parse(fs.readFileSync(path.resolve("src", "assets", "templates", "maps", "demo.json"), "utf-8"));
// const css = fs.readFileSync(path.resolve("routes/circles.css"), "utf-8")
const POSITION_INITIATIVE_NAME = { x: 0.75, y: 0.5, fontRatio: 1 };
const MAX_NUMBER_LETTERS_PER_CIRCLE = 15;
const DEFAULT_PICTURE_ANGLE = Math.PI - Math.PI * 36 / 180;
const CIRCLE_RADIUS = 16;

var margin = 20;
// const seedColor = "red";
const outerFontSizeRange = [14, 5];
const innerFontSizeRange = [10, 3];
const defaultScaleExtent = [0.5, 5];
let outerFontScale = d3.scaleLog().domain(defaultScaleExtent).range(outerFontSizeRange);
let innerFontScale = d3.scaleLog().domain(defaultScaleExtent).range(innerFontSizeRange);


export function makeChart(data: any, seedColor: string, diameter: number, width: number) {

    const document = new jsdom.JSDOM().window.document;


    var svg = d3.select(document.body) //make a container div to ease the saving process
        .append('svg')
        .attr("id", "map")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("overflow", "visible")
        .attr("preserveAspectRatio", "none")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("version", "1.1"),
        g = svg
            .append("g")
            .attr(
                "transform",
                `translate(${width / 2}, ${diameter / 2}) scale(1)`
            ),
        definitions = svg.append("svg:defs");

    // definitions.append("style").attr("type", "text/css").html(css);

    function zoomed() {
        g.attr("transform", d3.getEvent().transform);
    }

    const packing = d3
        .pack()
        .size([diameter - margin, diameter - margin])
        .padding(20);

    const root: any = d3
        .hierarchy(data)
        .sum(function (d: any) {
            return (d.accountable ? 1 : 0) + (d.helpers ? d.helpers.length : 0) + 1;
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });

    let depth = 0;
    root.eachAfter((n: any): void => {
        depth = depth > n.depth ? depth : n.depth;
    });
    const colorRange = getColorRange(depth, seedColor);

    const focus = root, nodes: Array<any> = packing(root).descendants();

    buildPatterns();
    // buildPaths()

    let initiativeWithChildren: any = g
        .selectAll("g.node.initiative-map.with-children")
        .data(nodes.filter(d => d.children), function (d: any) {
            return `${d.data.id}`;
        });

    let initiativeNoChildren: any = g
        .selectAll("g.node.initiative-map.no-children")
        .data(nodes.filter(d => !d.children), function (d: any) {
            return `${d.data.id}`;
        });


    exitWithAnimations(initiativeNoChildren);
    exitWithAnimations(initiativeWithChildren);

    let initiativeWithChildrenEnter = initiativeWithChildren.enter().append("g");
    let initiativeNoChildrenEnter = initiativeNoChildren.enter().append("g");

    enterWithAnimations(initiativeWithChildrenEnter, "with-children");
    enterWithAnimations(initiativeNoChildrenEnter, "no-children");

    // initiativeWithChildrenEnter.append("text").attr("class", "name with-children").classed("initiative-map", true);
    initiativeNoChildrenEnter.append("foreignObject").attr("class", "name no-children").classed("initiative-map", true);
    initiativeWithChildrenEnter.append("foreignObject").attr("class", "name with-children").classed("initiative-map", true);

    // initiativeWithChildrenEnter.append("circle").attr("class", "accountable with-children").classed("initiative-map", true);
    // initiativeNoChildrenEnter.append("circle").attr("class", "accountable no-children").classed("initiative-map", true);

    initiativeWithChildren = initiativeWithChildrenEnter.merge(initiativeWithChildren);
    initiativeNoChildren = initiativeNoChildrenEnter.merge(initiativeNoChildren);

    g.selectAll("g.node").sort((a: any, b: any) => {
        return b.height - a.height;
    });

    addCircle(initiativeWithChildren)
    addCircle(initiativeNoChildren)

    let node = g.selectAll("g.node");
    let circle = g.selectAll("circle.node");

    //     let textAround = initiativeWithChildren.select("text.name.with-children")
    //         .attr("id", function (d: any) {
    //             return `${d.data.id}`;
    //         })
    //         .style("display", function (d: any) {
    //             return d !== root ? "inline" : "none";
    //         })
    //         .html(function (d: any) {
    //             let radius = d.r * d.k + 1;
    //             return `<textPath xlink:href="#path${d.data.id}" startOffset="10%">
    //   <tspan>${d.data.name || ""}</tspan>
    //   </textPath>`;
    //             //   return browser === Browsers.Firefox
    //             //     ? `<textPath path="${uiService.getCircularPath(radius, -radius, 0)}" startOffset="10%">
    //             //             <tspan>${d.data.name || ""}</tspan>
    //             //             </textPath>`
    //             //     : `<textPath xlink:href="#path${d.data.id}" startOffset="10%">
    //             //             <tspan>${d.data.name || ""}</tspan>
    //             //             </textPath>`;
    //         });



    initiativeWithChildren.select("foreignObject.name.with-children")
        .attr("id", function (d: any) {
            return `${d.data.id}`;
        })
        .classed("initiative-map", true)
        .attr("x", function (d: any) {
            return -d.r * POSITION_INITIATIVE_NAME.x;
        })
        .attr("y", function (d: any) {
            return -d.r * POSITION_INITIATIVE_NAME.y;
        })
        .attr("width", function (d: any) { return d.r * 2 * 0.8 })
        .attr("height", function (d: any) { return d.r * 2 * 0.5 })
        .style("overflow", "visible")
        .html(getForeignObjectHTML)

    initiativeNoChildren.select("foreignObject.name.no-children")
        .attr("id", function (d: any) {
            return `${d.data.id}`;
        })
        .classed("initiative-map", true)
        .attr("x", function (d: any) {
            return -d.r * POSITION_INITIATIVE_NAME.x;
        })
        .attr("y", function (d: any) {
            return -d.r * POSITION_INITIATIVE_NAME.y;
        })
        .attr("width", function (d: any) { return d.r * 2 * 0.8 })
        .attr("height", function (d: any) { return d.r * 2 * 0.5 })
        .style("overflow", "visible")
        .html(getForeignObjectHTML)

    // let accountablePictureWithChildren = initiativeWithChildren.select("circle.accountable.with-children")
    //     .attr("id", function (d: any) {
    //         return `${d.data.id}`;
    //     })
    //     .attr("fill", function (d: any) {
    //         return d.data.accountable ? "url('#image" + d.data.id + "')" : "transparent";
    //     })
    // .style("display", function (d: any) {
    //     return d !== root ? "inline" : "none";
    // });

    // let accountablePictureWithoutChildren = initiativeNoChildren.select("circle.accountable.no-children")
    //     .attr("id", function (d: any) {
    //         return `${d.data.id}`;
    //     })
    //     .attr("fill", function (d: any) {
    //         return d.data.accountable ? "url('#image" + d.data.id + "')" : "transparent";
    //     })


    // let outerFontScale: ScaleLogarithmic<number, number>;
    // let innerFontScale: ScaleLogarithmic<number, number>;

    initMapElementsAtPosition([root.x, root.y]);
    adjustViewToZoomEvent(g, d3.getEvent());

    return document.body.innerHTML;

    function getForeignObjectHTML(d: any) {
        let fontSize = (d.r * 2 * 0.95 / MAX_NUMBER_LETTERS_PER_CIRCLE < 2) ? 1 : (d.r * 2 * 0.95 / MAX_NUMBER_LETTERS_PER_CIRCLE);
        let verySmallCircle = fontSize <= 2;

        const getImageTag = (picture: any) => {
            return picture ?
                `<img class="rounded-circle" src="${picture}" style="float:left;height:${!!picture ? fontSize * 2 : 0}px;width:${!!picture ? fontSize * 2 : 0}px" />`
                : "";
        }

        let accountablePicture = getImageTag(d.data.accountable ? d.data.accountable.picture : null)
        let helpersPictures = d.data.helpers.map((h: any) => getImageTag(h.picture)).join('');

        return `
            <div class="details d-flex flex-column align-items-start " style="font-size: ${fontSize}px;line-height:1.25;">
            ${accountablePicture}    
                <div class="primary ">
                    <div>${d.data.name || '(Empty)'}</div>
                </div>
                <div class="secondary d-flex flex-wrap">
                    ${helpersPictures}
                </div>
            </div>
            `;
    }

    function adjustViewToZoomEvent(g: any, event: any, force?: boolean): void {

        const zoomFactor: number = 1;
        const scaleExtent: Array<number> = [0.5, 5];
        outerFontScale.domain(scaleExtent);
        const myInnerFontScale: ScaleLogarithmic<number, number> = innerFontScale.domain(scaleExtent);

        const outerFontSize: number = outerFontScale(zoomFactor);

        // g.selectAll("g.node")
        // .attr("h", (d:any) => d.height )
        // .attr("d", (d:any) => d.depth )
        // .attr("p", (d:any) => d.parent ? d.parent.data.id : "" )
        // .attr("c", (d:any) => d.children ? d.children.length : 0 )

        g.selectAll("circle.node")
            .attr("zf", zoomFactor)
            .each((d: any) => (d.zf = zoomFactor))

        g.selectAll(".node.no-children, .node.with-children")
            .each(function (d: any): void {
                myInnerFontScale.range([d.r * Math.PI / MAX_NUMBER_LETTERS_PER_CIRCLE, 3]);
                let isVerySmallCircle = myInnerFontScale(zoomFactor) < 2;


                d3.select(this).select("foreignObject")
                    .style("padding", `${isVerySmallCircle ? 0 : 1}px`)
                d3.select(this).select("foreignObject div")
                    .attr("xmlns", "http://www.w3.org/1999/xhtml")
                    .style("font-size", () => {
                        return `${isVerySmallCircle ? 1 : myInnerFontScale(zoomFactor)}px`

                    });

                d3.select(this).selectAll("foreignObject > div.details > img, foreignObject > div.details > div.secondary > img")
                    .style("height", () => {
                        return `${isVerySmallCircle ? 1 : myInnerFontScale(zoomFactor)}px`

                    })
                    .style("width", () => {
                        return `${isVerySmallCircle ? 1 : myInnerFontScale(zoomFactor)}px`

                    });
                // .style("line-height", 1.3)
            });

        // g.selectAll("text.name.with-children")
        //     .style("font-size", `${outerFontSize * 0.75}px`)


        // const DEFAULT_PICTURE_ANGLE: number = DEFAULT_PICTURE_ANGLE;
        // const CIRCLE_RADIUS: number = CIRCLE_RADIUS;
        const ANGLE = Math.PI - Math.PI * 36 / 180;
        const accountableZoomFactor = zoomFactor > 1.7 ? 1.7 : zoomFactor;
        const getAccountableRadius = (d: any) => d.children ? outerFontSize * 0.75 : myInnerFontScale(zoomFactor) * 1.5;

        definitions.selectAll("pattern > image")
            .attr("width", (d: any): number => getAccountableRadius(d) * 2)
            .attr("height", (d: any): number => getAccountableRadius(d) * 2)


        g.selectAll("circle.accountable")
            .attr("r", (d: any): number => {
                return getAccountableRadius(d)  // CIRCLE_RADIUS / accountableZoomFactor;
            })
            .attr("cx", (d: any): number => {
                return 0
                // return d.children
                //     ? Math.cos(ANGLE) * ((d.r + 1) * accountableZoomFactor) - 6
                //     : 0;
            })
            .attr("cy", function (d: any): number {
                return -d.r * accountableZoomFactor * 0.75
                // return d.children
                //     ? -Math.sin(ANGLE) * ((d.r + 1) * accountableZoomFactor) + 6
                //     : -d.r * accountableZoomFactor * 0.75;
            })
            .attr("transform", `scale(${1 / accountableZoomFactor})`)
    }

    function initMapElementsAtPosition(v: any) {
        node
            // .transition()
            // .duration((d: any): number => d.children ? TRANSITION_DURATION / 5 : TRANSITION_DURATION / 5)
            .attr("transform", (d: any): string => `translate(${d.x - v[0]}, ${d.y - v[1]})`)
            // .style("opacity", function (d: any) {
            //     if (selectedTags.length === 0) return 1;
            //     return uiService.filter(selectedTags, unselectedTags, d.data.tags.map((t: Tag) => t.shortid))
            //         ? 1
            //         : 0.1
            // })
            .each((d: any) => (d.translateX = d.x - v[0]))
            .each((d: any) => (d.translateY = d.y - v[1]))

        circle
            .attr("r", function (d: any) {
                return d.r;
            })
            // .style("stroke", function (d: any) {
            //     return d.children
            //         ? colorRange(d.depth)
            //         : !d.children && d.parent === root ? d3.color(colorRange(d.depth)).darker(1).toString() : null;
            // })
            .style("fill", function (d: any) {
                return d.children
                    ? colorRange(d.depth)
                    : null;
            })
        // .style("fill-opacity", function (d: any) {
        //     return d.children
        //         ? 0.1
        //         : !d.children && d.parent === root ? 0.1 : 1;
        // })
        // .style("stroke-opacity", 0)

    }

    function exitWithAnimations(groups: any) {
        groups.exit().select("text")
            .remove();
        groups.exit().select("foreignObject")
            .remove();
        groups.exit().select("circle.accountable")
            .remove();
        groups.exit().select("circle.node")
            .classed("node--leaf", false)
            .classed("deleting", true)
            .attr("r", (d: any) => d.r)
            //   .transition(TRANSITION_1x)
            //   .style("stroke", COLOR_DELETE_CIRCLE)
            //   .style("fill", COLOR_DELETE_CIRCLE)
            //   .transition(TRANSITION_1x)
            .attr("r", 0)
            //   .transition(TRANSITION_1x)
            .remove();
        groups.exit()/*.transition(TRANSITION_1x)*/.remove();
    }

    function enterWithAnimations(groups: any, className: string, callback?: Function): void {
        groups
            .attr("class", (d: any): string => {
                return d.parent
                    ? d.children ? "node" : "node node--leaf"
                    : "node node--root";
            })
            .classed(className, true)
            .classed("initiative-map", true)
            .attr("id", (d: any): string => `${d.data.id}`);

        groups.append("circle")
            .style("fill", (d: any): string => {
                return d.children
                    ? colorRange(d.depth)
                    : !d.children && d.parent === root ? colorRange(d.depth) : null;
            })
            //   .transition(TRANSITION_2x)
            //   .style("fill", COLOR_ADD_CIRCLE)
            .attr("r", (d: any): number => d.r)
            //   .transition(TRANSITION_1x)
            .style("fill", (d: any): string => {
                return d.children
                    ? colorRange(d.depth)
                    : !d.children && d.parent === root ? colorRange(d.depth) : null;
            })
            .on("end", (d: any, i: number, e: Array<HTMLElement>): void => {
                const elements = e.filter(el => el);
                if (callback && i >= elements.length - 1) callback();
            });
        if (groups.empty() && callback) callback();
    }

    function buildPaths() {
        let path: any = svg.select("defs")
            .selectAll("path")
            .data(nodes, function (d: any) {
                return d.data.id;
            });

        path.exit().remove();
        path = path.enter()
            .append("path")
            .merge(path)
            .attr("id", function (d: any) {
                return `path${d.data.id}`;
            })
            .attr("d", function (d: any, i: number) {
                let radius = d.r + 1;
                return getCircularPath(radius, -radius, 0);
            });

        return path;
    }

    function addCircle(groups: any): void {
        groups.select("circle")
            .attr("class", (d: any): string => {
                return d.parent
                    ? d.children ? "node" : "node node--leaf"
                    : "node node--root";
            })
            .classed("initiative-map", true)
            .each((d: any) => d.k = 1)
            .attr("id", (d: any): string => `${d.data.id}`)
            .classed("with-border", (d: any): boolean => !d.children && d.parent === root)
    }

    function toREM(pixels: number) {
        return pixels / 16;
    }

    function buildPatterns() {
        let patterns = definitions.selectAll("pattern").data(
            nodes.filter(function (d: any) {
                return d.data.accountable;
            }),
            function (d: any) {
                return d.data.id;
            }
        );

        let enterPatterns = patterns
            .enter()
            .filter(function (d: any) {
                return d.data.accountable;
            })
            .append("pattern");

        enterPatterns
            .attr("id", function (d: any) {
                return "image" + d.data.id;
            })
            .attr("width", "100%")
            .attr("height", "100%")
            .filter(function (d: any) {
                return d.data.accountable;
            })
            .append("image")
            .attr("width", CIRCLE_RADIUS * 2)
            .attr("height", CIRCLE_RADIUS * 2)
            .attr("xlink:href", function (d: any) {
                return d.data.accountable.picture;
            });

        patterns
            .attr("id", function (d: any) {
                return "image" + d.data.id;
            })
            .attr("width", "100%")
            .attr("height", "100%")
            .filter(function (d: any) {
                return d.data.accountable;
            })
            .select("image")
            .attr("width", CIRCLE_RADIUS * 2)
            .attr("height", CIRCLE_RADIUS * 2)
            .attr("xlink:href", function (d: any) {
                return d.data.accountable.picture;
            });
        patterns.exit().remove();
    }
}



// makeChart()
// fs.writeFileSync("file.svg", document.body.innerHTML) //using sync to keep the code simple

