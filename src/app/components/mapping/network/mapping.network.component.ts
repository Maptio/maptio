import { Subject } from "rxjs/Rx";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Component, OnInit, Input, ViewEncapsulation, ChangeDetectorRef } from "@angular/core";
import { D3Service, D3, Force, DragBehavior, ForceLink, HierarchyNode } from "d3-ng2-service";
import { ColorService } from "../../../shared/services/ui/color.service"
import { UIService } from "../../../shared/services/ui/ui.service"
import { IDataVisualizer } from "../mapping.interface"
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import * as _ from "lodash";
import { User } from "../../../shared/model/user.data";
import { Role } from "../../../shared/model/role.data";

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
    public teamName: string;
    public teamId: string;
    public translateX: number;
    public translateY: number;
    public scale: number;


    public margin: number;
    public zoom$: Observable<number>
    public fontSize$: Observable<number>;
    public isLocked$: Observable<boolean>;
    public isReset$: Subject<boolean>;
    public data$: Subject<{ initiative: Initiative, datasetId: string }>;

    public rootNode: Initiative;
    public slug: string;

    public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>()
    public addInitiative$: Subject<Initiative> = new Subject<Initiative>();
    public removeInitiative$: Subject<Initiative> = new Subject<Initiative>();
    public moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }> = new Subject<{ node: Initiative, from: Initiative, to: Initiative }>();
    public closeEditingPanel$: Subject<boolean> = new Subject<boolean>();
    public analytics: Angulartics2Mixpanel;

    private zoomSubscription: Subscription;
    private dataSubscription: Subscription;

    T: any;
    TRANSITION_DURATION = 2250;
    private svg: any;
    private g: any;
    public tooltipInitiatives: Array<Initiative>;
    public tooltipRoles: Array<{ initiative: Initiative, role: Role }>;
    public tooltipSourceUser: User;
    public tooltipTargetUser: User;

    constructor(public d3Service: D3Service, public colorService: ColorService, public uiService: UIService,
        private cd: ChangeDetectorRef) {
        this.d3 = d3Service.getD3();
        this.T = this.d3.transition(null).duration(this.TRANSITION_DURATION);
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string }>();
        this.dataSubscription = this.data$.asObservable().distinct().subscribe(complexData => {
            let data = <any>complexData.initiative;
            this.datasetId = complexData.datasetId;
            this.rootNode = complexData.initiative;
            this.slug = data.getSlug();
            this.update(data)
        })
    }

    ngOnInit() {
        this.init();
    }

    ngOnDestroy() {
        if (this.zoomSubscription) {
            this.zoomSubscription.unsubscribe();
        }
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
    }

    init() {

        let d3 = this.d3;

        let svg: any = d3.select("svg"),
            margin = this.margin,
            diameter = +this.width
        let g = svg.append("g")
        .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform", `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`)

        let zooming = d3.zoom().scaleExtent([1 / 2, 4]).on("zoom", zoomed);

        // svg.append("rect")
        //     .attr("id", "zoom-layer")
        //     .attr("width", this.width)
        //     .attr("height", this.height)
        //     .style("fill", "none")
        //     .attr("pointer-events", "all")
        //     .call(zooming);

        function zoomed() {
            let transform = d3.event.transform;

            location.hash = `x=${transform.x}&y=${transform.y}&scale=${transform.k}`
            g.attr("transform", d3.event.transform);
        }

        try {
            // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
            // svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2, diameter / 2));
            svg.call(zooming.transform, d3.zoomIdentity.translate(this.translateX, this.translateY).scale(this.scale));
            svg.call(zooming);
        }
        catch (error) {

        }

        this.zoomSubscription = this.zoom$.subscribe((zf: number) => {
            try {
                // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
                if (zf) {
                    zooming.scaleBy(svg, zf);
                }
                else {
                    svg.call(zooming.transform, d3.zoomIdentity.translate(this.translateX, this.translateY));
                }
            }
            catch (error) {

            }
        })

        this.svg = svg;
        this.g = g;

    }

    private prepare(initiativeList: HierarchyNode<Initiative>[]) {

        let nodesRaw = initiativeList
            .map(d => {
                let all = _.flatten([...[d.data.accountable], d.data.helpers]);
                return _.uniqBy(_.remove(all), (a) => { return a.user_id });
            })
            .reduce((pre, cur) => {
                return [...pre, ...cur]
            })
            .map(u => {
                return { name: u.name, id: u.user_id, picture: u.picture };
            })
            ;

        let rawlinks = initiativeList.map(i => {
            return i.data;
        })
            .map(i => {
                return i.helpers.map(h => {
                    if (i.accountable && h.user_id !== i.accountable.user_id)
                        return {
                            source: h.user_id,
                            target: (i.accountable ? i.accountable.user_id : undefined),
                            type: "helps",
                            initiative: i.id
                        }
                })
            })
            .reduce((pre, cur) => {
                let reduced = _.remove([...pre, ...cur]);

                return reduced;
            })
            .map(l => {
                return {
                    linkid: `${l.source}-${l.target}`,
                    source: l.source,
                    target: l.target,
                    initiative: l.initiative,
                    type: l.type
                }
            })

        let links = _(rawlinks)
            .groupBy("linkid")
            .map((items: any, linkid: string) => {
                return (
                    {
                        source: items[0].source,
                        target: items[0].target,
                        type: items[0].type,
                        weight: items.length,
                        initiatives: items.map((item: any) => item.initiative)
                    })

            })
            .value();
        return { nodes: _.uniqBy(nodesRaw, (u) => { return u.id }), links: links }
    }

    hoverLink(nodesList: HierarchyNode<Initiative>[], initiativeIds: string[], sourceUserId: string, targetUserId: string) {
        let filtered = _.filter(nodesList, function (i) { return initiativeIds.includes(`${i.data.id}`); });
        this.tooltipInitiatives = filtered.map(n => n.data);
        this.tooltipSourceUser = this.tooltipInitiatives[0].helpers.filter(h => h.user_id === sourceUserId)[0];
        this.tooltipTargetUser = this.tooltipInitiatives[0].accountable;

        this.tooltipRoles = []
        this.tooltipInitiatives.forEach(i => {
            let role = i.helpers.filter(h => h.user_id === sourceUserId)[0].roles[0];
            this.tooltipRoles.push({ initiative: i, role: role })
        })

        this.cd.markForCheck();
    }

    showDetails(node: Initiative) {
        this.showDetailsOf$.next(node);
    }


    public update(data: any) {

        let d3 = this.d3;
        let svg = this.svg;
        let g = this.g;
        let width = this.width;
        let height = this.height;
        let hoverLink = this.hoverLink.bind(this);
        let CIRCLE_RADIUS: number = 20;
        let LINE_WEIGHT = 4;


        let node: any;
        let link: any;
        let bilinks: Array<any> = [];

        let initiativesList: HierarchyNode<Initiative>[] = this.d3.hierarchy(data).descendants();
        let graph = this.prepare(initiativesList);
        let color = d3.scaleOrdinal(d3.schemeCategory20);

        let simulation = d3.forceSimulation()
            .force("link", d3.forceLink()
                .id(function (d: any) { return d.id; }))
            .force("charge", d3.forceManyBody()
                .strength(function (d) { return -600; }))
            .force("center", d3.forceCenter(width / 2, height / 2));

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
            .attr("markerUnits", "userSpaceOnUse")
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        let nodes = graph.nodes,
            nodeById = d3.map(nodes, function (d: any) { return d.id; }),
            links = graph.links

        links.forEach(function (link: { source: string, target: string, weight: number, initiatives: Array<string> }) {
            let s = link.source = <any>nodeById.get(link.source),
                t = link.target = <any>nodeById.get(link.target),
                i = {},
                weight = link.weight,
                initiatives = link.initiatives; // intermediate node

            nodes.push(<any>i);
            links.push(<any>{ source: s, target: i }, <any>{ source: i, target: t });
            bilinks.push([s, i, t, weight, initiatives]);
        });

        console.log(bilinks);

        link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(bilinks)
            .enter().append("path")
            .attr("class", "link")
            .attr("data-initiatives", function (d: any) { return d[4].join(",") })
            .attr("data-source", function (d: any) { return d[0].id })
            .attr("data-target", function (d: any) { return d[2].id })
            .attr("stroke", "red")
            .attr("stroke-width", function (d: any) { return `${LINE_WEIGHT * d[3]}px` })
            .attr("marker-end", "url(#arrow)")
            .on("mouseover", function (d: any) {
                console.log(d3.select(this).attr("data-initiatives"))
            })
            .on("mouseout", function (d: any) {
                console.log(d3.select(this).attr("data-initiatives"))
            });

        node = g.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(nodes.filter(function (d) { return d.id; }))
            .enter().append("g")
            .attr("class", "node")
            .on("dblclick", releaseNode)
            .call(d3.drag<SVGElement, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("r", CIRCLE_RADIUS)
            .attr("fill", function (d: any) { return "url(#image" + d.id + ")" });

        node.append("text")
            .attr("dx", CIRCLE_RADIUS)
            .text(function (d: any) { return d.name; });


        g.selectAll("path")
            .on("mouseover", function (d: any) {
                let initiatives = d3.select(this).attr("data-initiatives").split(",");
                let source = d3.select(this).attr("data-source");
                let target = d3.select(this).attr("data-target");

                hoverLink(initiativesList, initiatives, source, target);
                d3.select("div.tooltip-initiative").style("visibility", "visible")
                    .style("top", () => { return d3.event.pageY > width / 2 * 0.80 ? "" : (d3.event.pageY - 30) + "px" })
                    .style("bottom", () => { return d3.event.pageY > width / 2 * 0.80 ? `${this.getBBox().height}px` : "" })

                    .style("left", () => { return d3.event.pageX > height * 0.70 ? "auto" : (d3.event.pageX) + "px" })
                    .style("right", () => { return d3.event.pageX > height * 0.70 ? "0" : "" })

                    .on("mouseenter", function () {
                        d3.select(this).style("visibility", "visible")
                    })
                    .on("mouseleave", function () {
                        d3.select("div.tooltip-initiative").style("visibility", "hidden")
                    })
            })
            .on("mousemove", function (d: any) {
                let initiatives = d3.select(this).attr("data-initiatives").split(",");
                let source = d3.select(this).attr("data-source");
                let target = d3.select(this).attr("data-target");

                hoverLink(initiativesList, initiatives, source, target);
                d3.select("div.tooltip-initiative").style("visibility", "visible")
                    .style("top", () => { return d3.event.pageY > width / 2 * 0.80 ? "" : (d3.event.pageY - 30) + "px" })
                    .style("bottom", () => { return d3.event.pageY > width / 2 * 0.80 ? `${this.getBBox().height}px` : "" })

                    .style("left", () => { return d3.event.pageX > height * 0.70 ? "auto" : (d3.event.pageX) + "px" })
                    .style("right", () => { return d3.event.pageX > height * 0.70 ? "0" : "" })
                    .on("mouseenter", function () {
                        d3.select(this).style("visibility", "visible")
                    })
                    .on("mouseleave", function () {
                        d3.select(this).style("visibility", "hidden")
                    })
            })
            .on("mouseout", function () {
                d3.select("div.tooltip-initiative").style("visibility", "hidden");
            })

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force<ForceLink<any, any>>("link").links(graph.links);


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
            d3.select(this).classed("fixed", d.fixed = true);
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d: any) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d: any) {
            if (!d3.event.active) simulation.alphaTarget(0);
            // d.fx = null;
            // d.fy = null;
        }

        function releaseNode(d: any) {
            d3.select(this).classed("fixed", d.fixed = false);
            d.fx = null;
            d.fy = null;
            d3.event.stopPropagation();
        }



        function cleanSelected() {
            node.classed("picked", false);
            node.each(function (d: any) { d.picked = d.previouslyPicked = false; })
        }

    }
}