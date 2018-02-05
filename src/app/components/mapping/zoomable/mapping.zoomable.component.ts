import { Observable, Subject } from "rxjs/Rx";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Component, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy } from "@angular/core";
import { D3Service, D3, ScaleLinear, HSLColor } from "d3-ng2-service";
import { transition } from "d3-transition"
import { ColorService } from "../../../shared/services/ui/color.service"
import { UIService } from "../../../shared/services/ui/ui.service"
import { IDataVisualizer } from "../mapping.interface"
import { UserFactory } from "../../../shared/services/user.factory";
import { Angulartics2Mixpanel } from "angulartics2";
import { DataService, URIService } from "../../../shared/services/data.service";
import { Tag, SelectableTag } from "../../../shared/model/tag.data";
import * as _ from "lodash";
import { SelectableUser } from "../../../shared/model/user.data";
import { Helper } from "../../../shared/model/helper.data";
import { MarkdownService } from "angular2-markdown";

@Component({
    selector: "zoomable",
    templateUrl: "./mapping.zoomable.component.html",
    styleUrls: ["./mapping.zoomable.component.css"],
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class MappingZoomableComponent implements IDataVisualizer {

    private d3: D3;
    public datasetId: string;
    public teamId: string;
    public teamName: string;
    public width: number;
    public height: number;
    public translateX: number;
    public translateY: number;
    public scale: number;
    public tagsState: Array<SelectableTag>;

    public margin: number;
    public zoom$: Observable<number>;
    public selectableTags$: Observable<Array<SelectableTag>>;
    public selectableUsers$: Observable<Array<SelectableUser>>;
    public isReset$: Observable<boolean>
    public fontSize$: Observable<number>;
    public isLocked$: Observable<boolean>;
    public data$: Subject<{ initiative: Initiative, datasetId: string, teamName: string, teamId: string }>;
    public rootNode: Initiative;

    public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
    public addInitiative$: Subject<Initiative> = new Subject<Initiative>();
    public removeInitiative$: Subject<Initiative> = new Subject<Initiative>();
    public moveInitiative$: Subject<{ node: Initiative, from: Initiative, to: Initiative }> = new Subject<{ node: Initiative, from: Initiative, to: Initiative }>();
    public closeEditingPanel$: Subject<boolean> = new Subject<boolean>();

    private zoomSubscription: Subscription;
    private dataSubscription: Subscription;
    private resetSubscription: Subscription;
    private fontSubscription: Subscription;
    private lockedSubscription: Subscription;
    private tagsSubscription: Subscription;

    public analytics: Angulartics2Mixpanel;

    private svg: any;
    private g: any;
    private diameter: number;
    private definitions: any;
    private fontSize: number;
    public isWaitingForDestinationNode: boolean = false;
    public isTooltipDescriptionVisible: boolean = false;
    public isFirstEditing: boolean = false;
    public isLocked: boolean;
    public isLoading: boolean;

    public selectedNode: Initiative;
    public selectedNodeParent: Initiative;
    public hoveredNode: Initiative;

    private color: ScaleLinear<HSLColor, string>;
    public slug: string;

    CIRCLE_RADIUS: number = 15;
    MAX_TEXT_LENGTH = 35;
    TRANSITION_DURATION = 2250;
    TRANSITION_OPACITY = 750;
    RATIO_FOR_VISIBILITY = 0.08;
    OPACITY_DISAPPEARING = 0.1;
    T: any;

    constructor(public d3Service: D3Service, public colorService: ColorService,
        public uiService: UIService, public router: Router,
        private userFactory: UserFactory, private cd: ChangeDetectorRef,
        private dataService: DataService, private uriService: URIService,
        private markdown: MarkdownService
    ) {
        this.d3 = d3Service.getD3();
        this.T = this.d3.transition(null).duration(this.TRANSITION_DURATION);
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string, teamName: string, teamId: string }>();

    }

    ngOnInit() {

        this.isLoading = true;
        this.init();
        this.dataSubscription = this.dataService.get()
            .combineLatest(this.selectableTags$)
            .subscribe(complexData => {
                // console.log("circles assign data")
                let data = <any>complexData[0].initiative;
                this.datasetId = complexData[0].datasetId;
                this.rootNode = complexData[0].initiative;
                this.slug = data.getSlug();
                this.tagsState = complexData[1];
                this.update(data, complexData[1]);
                this.analytics.eventTrack("Map", { view: "initiatives", team: data.teamName, teamId: data.teamId });
                this.isLoading = false;
                this.cd.markForCheck();
            })
    }

    init() {

        this.uiService.clean();
        let d3 = this.d3;

        let margin = { top: 20, right: 200, bottom: 20, left: 200 };
        let width = 1280 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;

        let svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom),
            diameter = +width,
            g = svg.append("g").attr("transform", `translate(${diameter / 2 + margin.left}, ${diameter / 2 + margin.top}) scale(1)`),
            definitions = svg.append("svg:defs");

        let zooming = d3.zoom().scaleExtent([1, 1])
            .on("zoom", zoomed)
            .on("end", () => {
                let transform = d3.event.transform;
                let tagFragment = this.tagsState.filter(t => t.isSelected).map(t => t.shortid).join(",")
                location.hash = this.uriService.buildFragment(new Map([["x", transform.x], ["y", transform.y], ["scale", transform.k], ["tags", tagFragment]]))
            });

        try {
            // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
            // svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2, diameter / 2));
            svg.call(zooming.transform, d3.zoomIdentity.translate(this.translateX, this.translateY).scale(1));
            svg.call(zooming);
        }
        catch (error) {

        }

        function zoomed() {
            g.attr("transform", d3.event.transform);
        }

        this.resetSubscription = this.isReset$.filter(r => r).subscribe(isReset => {
            svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2 + margin.left, diameter / 2 + margin.top));
        })


        this.fontSubscription = this.fontSize$.subscribe((fs: number) => {
            svg.attr("font-size", fs + "px");
            svg.selectAll(".label").attr("font-size", fs + "px");
            this.fontSize = fs;
        });
        let color = this.colorService.getDefaulColorRange(20)


        this.svg = svg;
        this.g = g;
        this.color = color;
        this.diameter = diameter;
        this.definitions = definitions;
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
        if (this.lockedSubscription) {
            this.lockedSubscription.unsubscribe();
        }
        if (this.tagsSubscription) {
            this.tagsSubscription.unsubscribe();
        }
    }


    update(data: any, tags: Array<SelectableTag>) {

        let d3 = this.d3;
        let diameter = this.diameter;
        let margin = this.margin;
        let g = this.g;
        let svg = this.svg;
        let definitions = this.definitions;
        let uiService = this.uiService;
        let fontSize = this.fontSize;
        let marginLeft = 200;
        let TOOLTIP_WIDTH = 300;
        let TOOLTIP_HEIGHT = 200;
        let TOOLTIP_PADDING = 20;
        let markdown = this.markdown;

        let pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(4)

        let root: any = d3.hierarchy(data)
            .sum(function (d) {
                return (d.accountable ? 1 : 0) + (d.helpers ? d.helpers.length : 0) + 1
            })
            .sort(function (a, b) { return b.value - a.value; });

        let depth = 0;
        root.eachAfter(function (n: any) {
            depth = (depth > n.depth) ? depth : n.depth;
        })
        let color = this.colorService.getDefaulColorRange(depth);

        let focus = root,
            nodes = pack(root).descendants(),
            view: any;


        let tooltip = d3.select("body").selectAll("div.arrow_box").data(nodes, function (d: any) { return d.data.id })
            .enter()
            .append("div")
            .attr("class", "arrow_box")
            .classed("show", false)
            .attr("id", function (d: any) { return `${d.data.id}`; })
            .html(function (d: any) {
                let tagsSpan = d.data.tags
                    ? d.data.tags.map((tag: Tag) => `
        <li><a class="btn btn-sm btn-secondary borderless mr-1 tag" style="color:${tag.color}">
                <i class="fa fa-tag mr-1" aria-hidden="true" style="color:${tag.color}"></i>${tag.name}
            </a></li>
        `).join("")
                    : "";

                let accountableImg = d.data.accountable
                    ? `<a >
                    <img src="${d.data.accountable.picture}" width="30" height="30" class="rounded-circle mr-2">
                    ${d.data.accountable.name}
                </a>`
                    : "<a ></a>";

                let helpersImg = d.data.helpers
                    ? d.data.helpers.map((helper: Helper) =>
                        `
                <a class="mr-1">
                    <img src="${helper.picture}" width="15" height="15" class="rounded-circle">
                    <small>${helper.name}</small>
                </a>`
                    ).join("")
                    : "";

                return `
                <h6 class="mb-1">${d.data.name}</h6>
                <div class="row p-3 d-flex justify-content-start" >${helpersImg}</div>
                <ul class="tags small"> ${tagsSpan}</ul>
                <small>${markdown.compile(d.data.description || "")}</small>
                </textPath>
                `
                    ;
            });





        let paths = g.append("g").attr("class", "paths");
        let path = paths.selectAll("path").data(nodes, function (d: any) { return d.data.id })
            .enter().append("path")
            .attr("id", function (d: any) { return `path${d.data.id}`; })
            .style("stroke", "none")
            .style("fill", "none")
            .attr("d", function (d: any, i: number) {
                let radius = d.r - 2;
                return uiService.getCircularPath(radius, -radius, 0);
            });


        let initiative = g.selectAll("g.node")
            .data(nodes, function (d: any) { return d.data.id })
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("id", function (d: any) { return `${d.data.id}`; })


        let circle = initiative.append("circle")
            .attr("id", function (d: any) { return `${d.data.id}`; })
            .attr("class", function (d: any) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function (d: any) { return d.children ? color(d.depth) : null; })
            .on("click", function (d: any) { if (focus !== d) zoom(d), d3.event.stopPropagation(); })


        let textAround = initiative.filter(function (d: any) { return d.children })
            .append("text")
            .attr("id", function (d: any) { return `${d.data.id}`; })
            .attr("class", "label")
            .classed("around", true)
            .style("fill", "#fff")
            .style("fill-opacity", function (d: any) { return (d.parent === root || d.depth <= 3) ? 1 : 0; })
            .style("display", function (d: any) { return d !== root ? (d.parent === root || d.depth <= 3) ? "inline" : "none" : "none" })
            .html(function (d: any) {
                return `<textPath xlink:href="#path${d.data.id}" startOffset="5%">
                <tspan>${d.data.name || ""}</tspan>
                </textPath>`
            })

        let initiativeName = initiative.filter(function (d: any) { return !d.children })
            .append("text")
            .attr("id", function (d: any) { return `${d.data.id}`; })
            .attr("class", "label")
            .classed("inside", true)
            .classed("name", true)
            .style("fill", "black")
            .attr("dy", 0)
            .attr("x", function (d: any) { return -d.r * .9 })
            .attr("y", function (d: any) { return -d.r * .5 })
            .attr("font-size", function (d: any) { return `${fontSize / d.depth}px` })
            .text(function (d: any) { return d.data.name })
            .each(function (d: any) {
                uiService.wrap(d3.select(this), d.data.name, d.data.tags, d.r * 2 * 0.95);
            });



        // let initiativeDescription = initiative.filter(function (d: any) { return !d.children })
        //     .append("text")
        //     .attr("id", function (d: any) { return `${d.data.id}`; })
        //     .attr("class", "label")
        //     .classed("inside", true)
        //     .classed("description", true)
        //     .style("fill", "black")
        //     .style("display", "none")
        //     .attr("dy", 0)
        //     .attr("x", function (d: any) { return -d.r * .9 })
        //     .attr("y", function (d: any) { return 0 })
        //     .attr("font-size", function (d: any) { return `${fontSize / d.depth}px` })
        //     .text(function (d: any) { return d.data.name })
        //     .each(function (d: any) {
        //         uiService.wrap(d3.select(this), d.data.description, d.data.tags, d.r * 2 * 0.95);
        //     });

        let node = g.selectAll("g.node");

        svg
            .on("click", function () { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d: any) {
            let focus0 = focus; focus = d;

            let transition = d3.transition("zooming")
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function (d) {
                    let i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function (t) { zoomTo(i(t)); };
                });

            transition.selectAll("text")
                .filter(function (d: any) { return d.parent === focus || (this as SVGElement).style.display === "inline"; })
            // .style("fill-opacity", function (d: any) { return d.parent === focus ? 1 : 0; })
            // .on("start", function (d: any) { if (d.parent === focus) (this as SVGElement).style.display = "inline"; })
            // .on("end", function (d: any) { if (d.parent !== focus) (this as SVGElement).style.display = "none"; });

            transition.selectAll("text.description")
                .on("start", function (d: any) { if (d.parent === focus || d === focus) (this as SVGElement).style.display = "inline"; })
                .on("end", function (d: any) { if (d.parent !== focus && d !== focus) (this as SVGElement).style.display = "none"; });

        }

        function zoomTo(v: any) {
            let k = diameter / v[2]; view = v;
            node.attr("transform", function (d: any) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function (d: any) { return d.r * k; })
                .on("mouseover", function (d: any) {
                    d3.event.stopPropagation();
                    let tooltip = d3.select(`div.arrow_box[id="${d.data.id}"]`);
                    let matrix = this.getScreenCTM()
                        .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));


                    TOOLTIP_HEIGHT = (tooltip.node() as HTMLElement).getBoundingClientRect().height;
                    tooltip
                        .style("left", (window.pageXOffset + matrix.e - TOOLTIP_WIDTH / 2) + "px")
                        .style("top", (window.pageYOffset + matrix.f - TOOLTIP_HEIGHT - 10 - d.r * k) + "px")
                        .classed("show", true)
                        .on("click", function (d: any) {
                            tooltip.classed("show", false)
                                .style("left", 0)
                                .style("top", 0)
                        })
                        .on("mouseenter", function () {
                            d3.select(this).classed("show", true)
                        })
                        .on("mouseleave", function () {
                            tooltip.classed("show", false)
                                .style("left", 0)
                                .style("top", 0)
                        });
                })
                .on("mouseout", function (d: any) {
                    let tooltip = d3.select(`div.arrow_box[id="${d.data.id}"]`);
                    tooltip.classed("show", false)
                        .style("left", 0)
                        .style("top", 0)

                })

            path.attr("transform", "scale(" + k + ")");

            initiativeName
                .attr("x", function (d: any) { return -d.r * k * .9 })
                .attr("y", function (d: any) { return -d.r * k * .2 })
                .attr("font-size", function (d: any) { return `${fontSize * k / d.depth}px` })
                .text(function (d: any) { return d.data.name })
                .each(function (d: any) {
                    uiService.wrap(d3.select(this), d.data.name, d.data.tags, d.r * k * 2 * 0.95);
                });
            // initiativeDescription
            //     .attr("x", function (d: any) { return -d.r * k * .9 })
            //     .attr("y", function (d: any) { return 0 })
            //     .attr("font-size", function (d: any) { return `${fontSize * k / d.depth}px` })
            //     .text(function (d: any) { return d.data.description })
            //     .each(function (d: any) {
            //         uiService.wrap(d3.select(this), d.data.description, d.data.tags, d.r * k * 2 * 0.95);
            //     });
        }
    }
}