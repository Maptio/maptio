import * as fs from "fs";
import * as path from "path"
import { transition } from "d3-transition";
import { select, selectAll, event, mouse } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { scaleLog, ScaleLogarithmic } from "d3-scale";
import { HierarchyCircularNode, pack, hierarchy } from "d3-hierarchy";
import { min } from "d3-array";
import { color } from "d3-color";
import {orderBy} from "lodash";

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
const POSITION_INITIATIVE_NAME = { x: 0.75, y: 0.55, fontRatio: 1 };
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

    var svg = d3.select(document.body) //make a container div to ease the saving process
        .append('svg')
        .attr("id", "map")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("overflow", "visible")
        .style("margin", "-13px") // to center the main group , no idea why this works
        .attr("preserveAspectRatio", "none")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("version", "1.1"),
        g = svg
            .append("g")
            .attr(
                "transform",
                `translate(${diameter / 2}, ${diameter / 2}) scale(1)`
            ),
        definitions = svg.append("svg:defs");




    let depth = 0;
    root.eachAfter((n: any): void => {
        depth = depth > n.depth ? depth : n.depth;
    });
    const colorRange = getColorRange(depth, seedColor);

    const nodes: Array<any> = packing(root).descendants();


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

    initiativeNoChildrenEnter.append("foreignObject").attr("class", "name no-children").classed("initiative-map", true);
    initiativeWithChildrenEnter.append("foreignObject").attr("class", "name with-children").classed("initiative-map", true);


    initiativeWithChildren = initiativeWithChildrenEnter.merge(initiativeWithChildren);
    initiativeNoChildren = initiativeNoChildrenEnter.merge(initiativeNoChildren);

    g.selectAll("g.node").sort((a: any, b: any) => {
        return b.height - a.height;
    });

    addCircle(initiativeWithChildren)
    addCircle(initiativeNoChildren)

    let node = g.selectAll("g.node");
    let circle = g.selectAll("circle.node");

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



    initMapElementsAtPosition([root.x, root.y]);
    adjustViewToZoomEvent(g, d3.getEvent());


    return document.body.innerHTML;

    function getForeignObjectHTML(d: any) {
        let fontSize = (d.r * 2 * 0.95 / MAX_NUMBER_LETTERS_PER_CIRCLE < 3) ? 1 : (d.r * 2 * 0.95 / MAX_NUMBER_LETTERS_PER_CIRCLE);
        let verySmallCircle = fontSize <= 3;

        const getImageTag = (user: any) => {
            if (!user) return "";
            return user.picture ?
                `<span class="member-picture" id="${user.shortid}" style="background: url(${user.picture}) no-repeat; float:left;height:${!!user.picture ? fontSize * 2 : 0}px;width:${!!user.picture ? fontSize * 2 : 0}px;background-position:center center;background-size:contain;border-radius:50%;"  data-member-name="${user.name}" data-member-shortid="${user.shortid}">
                </span>`
                : "";
        }

        let accountablePicture = getImageTag(d.data.accountable ? d.data.accountable : null)
        let helpersPictures = orderBy(d.data.helpers, h => h.name, "asc").map((h: any) => getImageTag(h)).join('');

        let tagLines = d.data.tags.map((t: any) => `<span data-tag-name="${t.name}" style="border-color:${t.color};background:${t.color};width:25%" class="tag-line badge mr-1"> </span>`).join('')
        return `
            <div  class="details d-flex flex-column align-items-start " style="font-size: ${fontSize}px;line-height:1.25;">
                ${accountablePicture}    
                <div class="primary authority">
                    <div>${d.data.name || '(Empty)'}</div>
                </div>
                <div class="secondary d-flex flex-column w-100">
                    <div class="tags d-flex flex-wrap" style="padding-bottom:10%">
                    ${tagLines}
                    </div>
                    <div class="helpers d-flex flex-wrap">
                    ${helpersPictures}
                    </div>
                    
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

                d3.select(this).selectAll("foreignObject > div.details > span > img, foreignObject > div.details > div.secondary > span.member-picture > img")
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
}

