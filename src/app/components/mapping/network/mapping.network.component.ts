import { Initiative } from "./../../../shared/model/initiative.data";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Component, OnInit, Input, ViewEncapsulation } from "@angular/core";
import { D3Service, D3, Force } from "d3-ng2-service";
import { ColorService } from "../../../shared/services/ui/color.service"
import { UIService } from "../../../shared/services/ui/ui.service"
import { IDataVisualizer } from "../mapping.interface"
import * as _ from "lodash";

@Component({
    selector: "network",
    templateUrl: "./mapping.network.component.html",
    styleUrls: ["./mapping.network.component.css"],
    encapsulation: ViewEncapsulation.None
})

export class MappingNetworkComponent implements OnInit, IDataVisualizer {

    private d3: D3;

    public datasetId: string;
    public width: number;
    public height: number;

    public margin: number;
    public zoom$: Observable<number>
    public fontSize$: Observable<number>;

    private zoomSubscription: Subscription;

    constructor(public d3Service: D3Service, public colorService: ColorService, public uiService: UIService) {
        this.d3 = d3Service.getD3();
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        if (this.zoomSubscription) {
            this.zoomSubscription.unsubscribe();
        }
    }


    private prepare(data: Initiative) {
        let nodes = new Array<{ id: string, picture: string, group: number }>();
        let links = new Array<{ source: string, target: string, value: number }>();
        data.traverse(n => {
            nodes = nodes.concat([...n.helpers.map(h => { return { id: h.name, picture: h.picture, group: 0 } }), { id: n.accountable ? n.accountable.name : undefined, picture: n.accountable ? n.accountable.picture : "", group: 0 }]);
            n.helpers.forEach(h => {
                links.push({ source: h.name, target: n.accountable ? n.accountable.name : undefined, value: 1 })
            })
        })
        nodes = _.remove(_.uniqWith(nodes, _.isEqual), n => n.id)
        return { nodes: nodes, links: links }
    }


    public draw(data: any) {

        let d3 = this.d3;
        let CIRCLE_RADIUS: number = 15;
        let graph = this.prepare(data);
        console.log(graph)


        let svg = d3.select("svg"),
            width = this.width,
            height = this.height;
        let node: any;
        let link: any;
        let bilinks: Array = [];
        let brush: any;
        let brushMode: any;
        let zoomLayer: any
        let brushLayer: any; // intercation canvas: Brush + zoom

        let color = d3.scaleOrdinal(d3.schemeCategory20);

        let simulation = d3.forceSimulation()
            .force("link", d3.forceLink().distance(200).id(function (d: any) { return d.id; }))
            .force("charge", d3.forceManyBody().distanceMin(200))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // add shift event
        d3.select("body")
        // .on("keydown", keydown)
        // .on("keyup", keyup)

        // brushable network: http://jsfiddle.net/pkerpedjiev/29majy5c/2/
        brush = d3.brush()
            .extent([[0, 0], [width, height]])
            .on("start", function (d) {
                node.each(function (d: any) { d.previouslyPicked = brushMode && d.picked; });
            })
            .on("brush", function () {
                if (!d3.event.selection) return;
                let extent = d3.event.selection,
                    zoomProp = d3.zoomTransform(zoomLayer.node());
                node.classed("picked", function (d: any) { return d.picked = d.previouslyPicked ^ ((extent[0][0] - zoomProp.x) / zoomProp.k <= d.x && d.x < (extent[1][0] - zoomProp.x) / zoomProp.k && (extent[0][1] - zoomProp.y) / zoomProp.k <= d.y && d.y < (extent[1][1] - zoomProp.y) / zoomProp.k); });
            })
            .on("end", function () {
                if (!d3.event.selection) return;
                d3.select(this).call(d3.event.target.move, null);
            })

        let zoom = d3.zoom()
            .scaleExtent([1 / 2, 4])
            .on("zoom", zoomed);

        brushLayer = svg.append("g")
            .attr("id", "brush-layer")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .datum(function () { return { picked: false, previouslyPicked: false }; })
            .call(brush)
            .on("click", function (d) {
                node.classed("picked", false);
                node.each(function (d: any) { d.picked = d.previouslyPicked = false; })
            });


        zoomLayer = svg.append("rect")
            .attr("id", "zoom-layer")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .attr("pointer-events", "all")
            .call(zoom)





        let g = svg.append("g").attr("width", width)
            .attr("height", height).attr("transform", "translate(" + 0 + "," + -380 + ")"), transform = d3.zoomIdentity;

        let definitions = g.append("defs")
        definitions.selectAll("pattern")
            .data(graph.nodes)
            .enter()
            .append("pattern")
            .attr("id", function (d: any) { return "image" + d.id; })
            .attr("width", "100%")
            .attr("height", "100%")
            .append("image")
            .attr("width", CIRCLE_RADIUS * 2)
            .attr("height", CIRCLE_RADIUS * 2)
            .attr("xlink:href", function (d: any) { return d.picture })
            ;

        svg.append("defs").append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 20)
            .attr("refY", 0)
            .attr("markerWidth", CIRCLE_RADIUS)
            .attr("markerHeight", CIRCLE_RADIUS)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        let nodes = graph.nodes,
            nodeById = d3.map(nodes, function (d) { return d.id; }),
            links = graph.links

        links.forEach(function (link) {
            let s = link.source = nodeById.get(link.source),
                t = link.target = nodeById.get(link.target),
                i = {}; // intermediate node
            nodes.push(i);
            links.push({ source: s, target: i }, { source: i, target: t });
            bilinks.push([s, i, t]);
        });

        link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(bilinks)
            .enter().append("path")
            .attr("class", "link")
            .attr("marker-end", "url(#arrow)");

        node = g.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(nodes.filter(function (d) { return d.id; }))
            .enter().append("g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("r", CIRCLE_RADIUS)
            // .attr("fill", function (d: any) { return color(d.group); });
            .attr("fill", function (d: any) { return "url(#image" + d.id + ")" })


        node.append("text")
            .attr("dx", CIRCLE_RADIUS)
            .text(function (d: any) { return d.id; });

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link").links(graph.links);

        function ticked() {
            link.attr("d", positionLink);
            node.attr("transform", positionNode);
        }

        function positionLink(d: any) {
            return "M" + d[0].x + "," + d[0].y
                + "S" + d[1].x + "," + d[1].y
                + " " + d[2].x + "," + d[2].y;
        }

        function positionNode(d: any) {
            return "translate(" + d.x + "," + d.y + ")";
        }


        function dragstarted(d: any) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d: any) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d: any) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // function keydown() {
        //     brushMode = d3.event.metaKey;
        //     cleanNodes = d3.event.keyCode === 68;
        //     if (brushMode) zoomLayer.attr("pointer-events", "none");
        //     if (cleanNodes) cleanSelected();
        // }

        // function keyup() {
        //     brushMode = d3.event.metaKey;
        //     if (!brushMode) zoomLayer.attr("pointer-events", "all");
        // }

        function zoomed() {
            g.attr("transform", d3.event.transform);
        }

        function cleanSelected() {
            node.classed("picked", false);
            node.each(function (d: any) { d.picked = d.previouslyPicked = false; })
        }
    }
}