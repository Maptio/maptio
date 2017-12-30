import { Subject } from "rxjs/Rx";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from "@angular/core";
import { D3Service, D3, ForceLink, HierarchyNode } from "d3-ng2-service";
import { ColorService } from "../../../shared/services/ui/color.service"
import { UIService } from "../../../shared/services/ui/ui.service"
import { IDataVisualizer } from "../mapping.interface"
import { Angulartics2Mixpanel } from "angulartics2";
import * as _ from "lodash";
import { User } from "../../../shared/model/user.data";
import { Role } from "../../../shared/model/role.data";
import { Router } from "@angular/router";
import { DataService } from "../../../shared/services/data.service";
import { Tag } from "../../../shared/model/tag.data";

@Component({
    selector: "network",
    templateUrl: "./mapping.network.component.html",
    styleUrls: ["./mapping.network.component.css"],
    encapsulation: ViewEncapsulation.Emulated
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
    public selectableTags$: Observable<Array<Tag>>;
    public zoom$: Observable<number>
    public fontSize$: Observable<number>;
    public isLocked$: Observable<boolean>;
    public isReset$: Observable<boolean>;
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
    private resetSubscription: Subscription;
    private fontSubscription: Subscription;

    T: any;
    TRANSITION_DURATION = 2250;

    CIRCLE_RADIUS: number = 25;
    LINE_WEIGHT = 4;
    FADED_OPACITY = 0.1
    private svg: any;
    private g: any;
    // private link: any;
    private fontSize: number;
    public tooltipInitiatives: Array<Initiative>;
    public tooltipRoles: Array<{ initiative: Initiative, role: Role }>;
    public tooltipSourceUser: User;
    public tooltipTargetUser: User;
    public isLoading: boolean;

    constructor(public d3Service: D3Service, public colorService: ColorService, public uiService: UIService,
        private cd: ChangeDetectorRef, private router: Router, private dataService: DataService) {
        // console.log("network constructor")
        this.d3 = d3Service.getD3();
        this.T = this.d3.transition(null).duration(this.TRANSITION_DURATION);
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string, teamName: string, teamId: string }>();

    }

    ngOnInit() {
        this.isLoading = true;
        this.init();
        this.dataSubscription = this.dataService.get().subscribe(complexData => {
            // console.log("network assign data")
            let data = <any>complexData.initiative;
            this.datasetId = complexData.datasetId;
            this.rootNode = complexData.initiative;
            this.slug = data.getSlug();
            this.update(data);
            this.analytics.eventTrack("Map", { view: "connections", team: data.teamName, teamId: data.teamId });
            this.isLoading = false;
            this.cd.markForCheck();
        })
    }

    ngOnDestroy() {
        if (this.zoomSubscription) {
            this.zoomSubscription.unsubscribe();
        }
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
        if (this.resetSubscription) {
            this.resetSubscription.unsubscribe();
        }
        if (this.fontSubscription) {
            this.fontSubscription.unsubscribe();
        }
    }

    init() {
        this.uiService.clean();

        let d3 = this.d3;

        let svg: any = d3.select("svg");
            // margin = this.margin,
            // diameter = +this.width
        let g = svg.append("g")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform", `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`)
        g.append("g").attr("class", "links");
        g.append("g").attr("class", "labels");
        g.append("g").attr("class", "nodes");
        g.append("defs");

        svg.style("background", "#f7f7f7");


        svg.append("svg:defs").selectAll("marker")
            .data([{ id: "arrow", opacity: 1 }, { id: "arrow-fade", opacity: this.FADED_OPACITY }])
            .enter().append("marker")
            .attr("id", (d: any) => d.id)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 19)
            .attr("refY", 0)
            .attr("markerWidth", this.CIRCLE_RADIUS)
            .attr("markerHeight", this.CIRCLE_RADIUS)
            .attr("markerUnits", "userSpaceOnUse")
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#bbb")
            .style("opacity", (d: any) => d.opacity);


        let zooming = d3.zoom().scaleExtent([1 / 10, 4])
            .on("zoom", zoomed)
            .on("end", () => {
                let transform = d3.event.transform;
                location.hash = `x=${transform.x}&y=${transform.y}&scale=${transform.k}`;
            });

        function zoomed() {
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

        this.resetSubscription = this.isReset$.filter(r => r).subscribe(isReset => {
            svg.call(zooming.transform, d3.zoomIdentity.translate(0, -this.height / 4));
        })

        this.fontSubscription = this.fontSize$.subscribe((fs: number) => {
            this.fontSize = fs;
            svg.attr("font-size", fs + "px");
            svg.selectAll("text").attr("font-size", fs + "px");
        });

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
                return {
                    name: u.name,
                    id: u.user_id,
                    picture: u.picture,
                    shortid: u.shortid,
                    slug: u.getSlug()
                };
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

    hoverLink(nodes: Initiative[], initiativeIds: string[], sourceUserId: string, targetUserId: string) {
        this.tooltipInitiatives = _.filter(nodes, function (i) { return initiativeIds.includes(`${i.id}`); });

        if (_.isEmpty(this.tooltipInitiatives)) return;

        this.tooltipSourceUser = this.tooltipInitiatives[0].helpers.filter(h => h.user_id === sourceUserId)[0];
        this.tooltipTargetUser = this.tooltipInitiatives[0].accountable;

        this.tooltipRoles = [];
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

        if (!this.g) {
            this.init();
        }

        let d3 = this.d3;
        // let svg = this.svg;
        let g = this.g;
        let fontSize = this.fontSize;
        let width = this.width;
        let height = this.height;
        let hoverLink = this.hoverLink.bind(this);
        let bilinks: Array<any> = [];

        let CIRCLE_RADIUS = this.CIRCLE_RADIUS
        let LINE_WEIGHT = this.LINE_WEIGHT;
        // let FADED_OPACITY = this.FADED_OPACITY;

        let initiativesList: HierarchyNode<Initiative>[] = this.d3.hierarchy(data).descendants();
        let graph = this.prepare(initiativesList);

        let router = this.router;
        let datasetId = this.datasetId;
        let slug = this.slug;

        let simulation = d3.forceSimulation()
            .force("link", d3.forceLink()
                .id(function (d: any) { return d.id; }))
            .force("charge", d3.forceManyBody().distanceMax(400)
                .strength(function (d) { return -600; }))
            .force("center", d3.forceCenter(width / 2, height / 2));


        let patterns = g.select("defs").selectAll("pattern").data(graph.nodes)
        patterns
            .enter()
            .append("pattern").merge(patterns)
            .attr("id", function (d: any) { return "image" + d.id; })
            .attr("width", "100%")
            .attr("height", "100%")
            .append("image")
            .attr("width", CIRCLE_RADIUS * 2)
            .attr("height", CIRCLE_RADIUS * 2)
            .attr("xlink:href", function (d: any) { return d.picture })
            ;

        let nodes = graph.nodes,
            nodeById = d3.map(nodes, function (d: any) { return d.id; }),
            links = graph.links

        links.forEach(function (link: { source: string, target: string, weight: number, initiatives: Array<string> }) {
            let s = link.source = <any>nodeById.get(link.source),
                t = link.target = <any>nodeById.get(link.target),
                i = {},
                weight = link.weight,
                initiatives = link.initiatives,
                id = `${s.id}-${t.id}`; // intermediate node

            nodes.push(<any>i);
            links.push(<any>{ source: s, target: i }, <any>{ source: i, target: t });
            bilinks.push([s, i, t, weight, initiatives, id]);
        });

        let link = g.select("g.links").selectAll("path.edge").data(bilinks, function (d: any) { return d[5]; })
        link.exit().remove();

        link = link.enter().append("path").attr("class", "edge")
            .merge(link)
            .attr("data-initiatives", function (d: any) { return d[4].join(",") })
            .attr("data-source", function (d: any) { return d[0].id })
            .attr("data-target", function (d: any) { return d[2].id })
            .attr("stroke-width", function (d: any) { return `${LINE_WEIGHT * d[3]}px` })
            .attr("id", function (d: any) { return d[5] })
            .attr("marker-end", "url(#arrow)")
        // .on("m ouseout", fade(1));


        // let labelPaths = g.select("defs").selectAll("path").data(bilinks);
        // labelPaths = labelPaths
        //     .enter()
        //     .append("path").merge(labelPaths)
        //     .attr("id", function (d: any) { return "path" + d[5]; });

        let label = g.select("g.labels").selectAll("text.edge").data(bilinks, function (d: any) { return d[5]; })
        label.exit().remove();

        label = label.enter().append("text").attr("class", "edge")
            .merge(label)
            .attr("font-size", `${fontSize * 0.8}px`)
            .style("display", "none")
            .html(function (d: any) {
                let source = d[0];
                let target = d[2]

                let filtered = initiativesList.filter((i: any) => d[4].includes(i.data.id)).map(i => i.data);

                if (filtered.length > 0) {
                    let h = filtered
                        .map((i, ix) => `<tspan class="is-helping" x="0" y="0" dy="${ix + 1}em">${i.name}</tspan>`).join("")

                    return `<tspan  x="0" y="0" class="is-helping-title" dy="0em">${source.name} helps ${target.name} with</tspan>` + h;
                }
            });

        let node = g.select("g.nodes").selectAll("g.node").data(nodes.filter(function (d) { return d.id; }))
        node.exit().remove();

        node = node.enter().append("g").attr("class", "node")
            .merge(node)
            .on("dblclick", releaseNode)
            .call(d3.drag<SVGElement, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle");
        node.append("text").attr("class", "authority-name");
        // node.append("text").attr("class", "initiatives");

        node.select("circle").attr("r", CIRCLE_RADIUS)
            .attr("fill", function (d: any) { return "url(#image" + d.id + ")" })
            .attr("pointer-events", "auto")
            .attr("cursor", "move")
        // .on("mouseover", fade(FADED_OPACITY))
        // .on("mouseout", fade(1))
        // .on("mouseleave", () => {
        //     d3.selectAll("text.edge").style("display", "none");
        // })


        node.select("text.authority-name")
            .attr("pointer-events", "auto")
            .attr("cursor", "pointer")
            .attr("dx", CIRCLE_RADIUS + 3)
            .attr("dy", CIRCLE_RADIUS / 2)
            .on("click", function (d: any) {
                router.navigateByUrl(`/map/${datasetId}/${slug}/u/${d.shortid}/${d.slug}`);
            })
            .text(function (d: any) { return d.name; })
            ;

        g.selectAll("path")
            .on("mouseover", function (d: any) {
                let initiatives = d3.select(this).attr("data-initiatives").split(",");
                let source = d3.select(this).attr("data-source");
                let target = d3.select(this).attr("data-target");

                hoverLink(initiativesList.map(d => d.data), initiatives, source, target);
                d3.select("div.tooltip-initiative").style("visibility", "visible")
                    .style("top", () => { return d3.event.pageY > width / 2 * 0.80 ? "" : (d3.event.pageY - 30) + "px" })
                    .style("bottom", () => { return d3.event.pageY > width / 2 * 0.80 ? `${this.getBBox().height}px` : "" })

                    .style("left", () => { return d3.event.pageX > height * 0.70 ? "auto" : (d3.event.pageX - 8) + "px" })
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

                hoverLink(initiativesList.map(d => d.data), initiatives, source, target);
                d3.select("div.tooltip-initiative").style("visibility", "visible")
                    .style("top", () => { return d3.event.pageY > width / 2 * 0.80 ? "" : (d3.event.pageY - 30) + "px" })
                    .style("bottom", () => { return d3.event.pageY > width / 2 * 0.80 ? `${this.getBBox().height}px` : "" })

                    .style("left", () => { return d3.event.pageX > height * 0.70 ? "auto" : (d3.event.pageX - 8) + "px" })
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
            // labelPaths.attr("d", positionLabelPath);
            label.attr("transform", positionLabel);
        }

        function positionLabel(d: any) {
            let path = g.select("defs").select(`path[id="path${d[5]}"]`);
            if (path.node()) {
                let p = path.node().getPointAtLength(.6 * path.node().getTotalLength());
                return "translate(" + (p.x) + "," + p.y + ")";
            }
            else {
                return "translate(" + 0 + "," + 0 + ")";
            }
        }


        // function positionLabelPath(d: any) {
        //     return "M" + d[0].x + "," + d[0].y
        //         + "S" + d[1].x + "," + d[1].y
        //         + " " + d[2].x + "," + d[2].y;
        // }

        function positionLink(d: any) {
            return "M" + d[0].x + "," + d[0].y
                + "S" + d[1].x + "," + d[1].y
                + " " + d[2].x + "," + d[2].y;
        }

        function positionNode(d: any) {
            return "translate(" + d.x + "," + d.y + ")";
        }

        // function getHelpingInitiatives(source: any, target: any, hovered: any, ids: string[]) {
        //     let filtered = initiativesList.filter((i: any) => ids.includes(i.data.id)).map(i => i.data);

        //     let [authoredInitiative, helpedInitiative] = _.partition(filtered, i => i.accountable.user_id === hovered.id)
        //     if (helpedInitiative.length > 0) {
        //         let h = helpedInitiative
        //             .map((i, ix) => `<tspan class="is-helping" x="0" y="0" dy="${ix + 1}em">${i.name}</tspan>`).join("")

        //         return `<tspan  x="0" y="0" class="is-helping-title" dy="0em">helps ${target.name} with</tspan>` + h;
        //     }

        // }

        // function getAuthoredInitiatives(hovered: any) {
        //     let authoredInitiative = initiativesList.filter(i => i.data.accountable && i.data.accountable.user_id === hovered.id)
        //     if (authoredInitiative.length > 0) {
        //         let a = authoredInitiative.map((i, ix) => `<tspan class="is-responsible" x="0" y="1em" dx="${CIRCLE_RADIUS}" dy="${ix + 1}em">${i.data.name}</tspan>`).join("")
        //         return a;
        //     }
        // }

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

        // const linkedByIndex = {};
        // graph.links.forEach(d => {
        //     linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
        // });

        // function isConnected(a: any, b: any) {
        //     return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
        // }

        // function fade(opacity: number) {
        //     return (d: any) => {
        //         node.style("stroke-opacity", function (o: any) {
        //             const thisOpacity = isConnected(d, o) ? 1 : opacity;
        //             this.setAttribute("fill-opacity", thisOpacity);
        //             return thisOpacity;
        //         });

        //         label
        //             .style("font-size", function (o: any) { fontSize * 1.2 })

        //             .style("display", (o: any) => {
        //                 return (o[0] === d || o[2] === d ? "inline" : "none");
        //             })

        //         link.style("stroke-opacity", (o: any) => {
        //             return (o[0] === d || o[2] === d ? 1 : opacity);
        //         });
        //         link.attr("marker-end", (o: any) => (opacity === 1 || o[0] === d || o[2] === d ? "url(#arrow)" : "url(#arrow-fade)"));
        //     };
        // }

        // function cleanSelected() {
        //     node.classed("picked", false);
        //     node.each(function (d: any) { d.picked = d.previouslyPicked = false; })
        // }

    }
}