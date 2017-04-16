import { EmitterService } from './../../../shared/services/emitter.service';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Initiative } from './../../../shared/model/initiative.data';
import { TooltipComponent } from './../tooltip/tooltip.component';

import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from "@angular/core";
import { D3Service, D3, HierarchyCircularNode } from "d3-ng2-service";
import { ColorService } from "../../../shared/services/color.service"
import { UIService } from "../../../shared/services/ui.service"
import { IDataVisualizer } from "../mapping.interface"

@Component({
    selector: "circles",
    template: require("./mapping.circles.component.html"),
    styles: [require("./mapping.circles.component.css").toString()],
})


export class MappingCirclesComponent implements OnInit, IDataVisualizer {

    private d3: D3;

    // @ViewChild("tooltip")
    // public tooltip: TooltipComponent;

    public width: number;
    public height: number;

    public margin: number;


    constructor(public d3Service: D3Service, public colorService: ColorService, public uiService: UIService) {
        this.d3 = d3Service.getD3();
    }

    ngOnInit() {

    }


    draw(data: any) {

        let d3 = this.d3;
        let colorService = this.colorService;
        let uiService = this.uiService;
        let width = this.width;

        // let height = this.height;
        let margin = this.margin;

        if (!data) {
            // console.log("CLEAN");
            uiService.clean();
            return;
        }

        uiService.clean();

        let svg = d3.select("svg"),
            // margin = 50,
            diameter = +width,
            g = svg.append("g")
                .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")")
            , transform = d3.zoomIdentity

        try {
            // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
            let zooming = d3.zoom().scaleExtent([2 / 3, 2]).on("zoom", zoomed);
            svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2, diameter / 2));
            svg.call(zooming);
        }
        catch (error) {

        }

        function zoomed() {
            g.attr("transform", d3.event.transform)
        }

        let color = colorService.getDefaulColorRange();

        let pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(20);

        let root = data;

        root = d3.hierarchy(root)
            .sum(function (d: any) { return 1; }) // all nodes have the same initial size
            .sort(function (a, b) { return b.value - a.value });


        let focus = root,
            nodes = pack(root).descendants(),
            view: any;

        let circle = g.selectAll("circle")
            .data(nodes)
            .remove()
            .enter()
            .append("circle")
            // .attr("id", function (d, i) { return i; })
            .attr("class", function (d: any) { return d.parent ? (d.children ? "node" : "node node--leaf") : "node node--root"; })
            .style("fill", function (d: any) { return d.children ? color(d.depth) : "white"; })
            .style("stroke", function (d: any) { return d.data.isSearchedFor ? "#d9831f" : "none" })
            .style("stroke-width", function (d: any) { return d.data.isSearchedFor ? 3 : "none" })
            .attr("id", function (d: any) { return "circle" + d.data.id; })
            .on("click", function (d: any, i: number) {
                if (focus !== d) {
                    zoom(d, i),
                        d3.selectAll("#title" + d.data.id).style("fill-opacity", 1).style("display", "inline"),
                        d3.event.stopPropagation();
                }
            });

        let definitions = svg.append("defs")
        let path = definitions.selectAll("path")
            .data(nodes)
            .enter()
            .append("path")
            .attr("id", function (d: any) { return "path" + d.data.id; });


        let text = g.selectAll("text")
            .data(nodes);


        text
            .enter()
            .append("text")
            .filter(function (d: any) { return d.children; })
            .attr("id", function (d: any) { return "title" + d.data.id; })
            .on("click", function (d: any, i: number) {

                showTooltip(d, d3.event.clientX, d3.event.clientY);
                d.isTooltipVisible = !d.isTooltipVisible;
            })
            .style("display", function (d: any) { return d === root ? "none" : "inline"; })
            .attr("font-size", "1em")
            .append("textPath")
            .attr("xlink:href", function (d: any) { return "#path" + d.data.id; })
            .attr("startOffset", function (d, i) { return "10%"; })
            .text(function (d: any) { return d.data.name; })
            ;

        text
            .enter()
            .append("text")
            .filter(function (d: any) { /*console.log(d.data.name + " " + d.children);*/ return !d.children; })
            .attr("font-size", "0.8em")
            .attr("id", function (d: any) { return "title" + d.data.id; })
            .on("click", function (d: any, i: number) {
                showTooltip(d, d3.event.clientX, d3.event.clientY);
                d.isTooltipVisible = !d.isTooltipVisible;
            })
            .attr("dy", 0)
            .attr("x", function (d: any) { return -d.r * .85 })
            .attr("y", function (d: any) { return -d.r * .1 })
            .text(function (d: any) { return d.data.name; })
            .each(function (d: any) {
                uiService.wrap(d3.select(this), d.data.name, d.r * 2 * 0.95);
            })
            ;


        let node = g.selectAll("path,circle,text");

        svg
            .style("background", color(-1))
            .on("click", function () { zoom(root, 0); });

        let zoomedNode: HierarchyCircularNode<any> = nodes.find(function (d: any) { return d.data.isZoomedOn === true });
        if (!zoomedNode) {
            zoomedNode = root;
        }
        zoomTo([zoomedNode.x, zoomedNode.y, zoomedNode.r * 2 + margin], parseInt(zoomedNode.id));
        if (zoomedNode !== root)
            d3.selectAll("#title" + parseInt(zoomedNode.data.id)).style("fill-opacity", 1).style("display", "inline");

        function zoom(d: any, index: number) {
            let focus0 = focus; focus = d;

            let transition = d3.transition("move")
                // .duration(d3.event.altKey ? 7500 : 750)
                .duration(750)
                .tween("zoom", function (d) {
                    let i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function (t) { zoomTo(i(t), index); };
                });

            let updateCounter = 0;

            transition.selectAll("text")
                .filter(function (d: any) { return d.parent === focus || (<any>this).style.display === "inline"; })
                // .style("fill-opacity", function (d: any) { return d.parent === focus || (d === focus && !d.children) ? 1 : (d === focus ? 0.4 : 0); })
                .on("start", function (d: any) { if (d.parent === focus) (<any>this).style.display = "inline"; })
                .each(function (d: any) { updateCounter++ })
                .on("end", function (d: any) {
                    // if (d.parent !== focus) this.style.display = "none";
                    updateCounter--;
                    if (updateCounter === 0) {
                        uiService.adjustLabels(text, (diameter / d.r / 2));
                    }
                })
        }

        function zoomTo(v: any, index: number) {
            let k = diameter / v[2]; view = v;
            node.attr("transform", function (d: any) {
                return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"
            });

            circle.attr("r", function (d: any) { return d.r * k; });

            path.attr("d", function (d, i) {
                let radius = d.r * k + 3;
                return uiService.getCircularPath(radius, -radius, 0);
            })
        }

        function showTooltip(d: any, x: number, y: number) {
            uiService.setTooltipData(d.data);
            d3.select(".initative-tooltip")
                .classed("hidden", d.isTooltipVisible)
                .style("left", 50 + "px")
                .style("top", 0 + "px")
        }
    }
}