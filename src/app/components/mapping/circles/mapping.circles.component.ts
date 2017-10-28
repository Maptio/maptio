import { Observable, Subject } from "rxjs/Rx";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Component, OnInit, Input, ViewEncapsulation, EventEmitter, Output } from "@angular/core";
import { D3Service, D3, HierarchyCircularNode } from "d3-ng2-service";
import { ColorService } from "../../../shared/services/ui/color.service"
import { UIService } from "../../../shared/services/ui/ui.service"
import { IDataVisualizer } from "../mapping.interface"
import { UserFactory } from "../../../shared/services/user.factory";

@Component({
    selector: "circles",
    templateUrl: "./mapping.circles.component.html",
    styleUrls: ["./mapping.circles.component.css"],
    encapsulation: ViewEncapsulation.None
})

export class MappingCirclesComponent implements IDataVisualizer {

    private d3: D3;

    // @ViewChild("tooltip")
    // public tooltip: TooltipComponent;
    public datasetId: string;
    public width: number;
    public height: number;
    public translateX: number;
    public translateY: number;
    public scale: number;

    public margin: number;
    public zoom$: Observable<number>
    public fontSize$: Observable<number>;
    public data$: Subject<{ initiative: Initiative, datasetId: string }>;

    public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
    public addInitiative$: Subject<Initiative> = new Subject<Initiative>();
    public removeInitiative$: Subject<Initiative> = new Subject<Initiative>();

    private zoomSubscription: Subscription;
    private dataSubscription: Subscription;

    private counter: number = 0;
    private svg: any;
    private g: any;
    private definitions: any;

    CIRCLE_RADIUS: number = 15;

    constructor(public d3Service: D3Service, public colorService: ColorService, public uiService: UIService, public router: Router, private userFactory: UserFactory) {
        // console.log("setup", this.translateX, this.translateY, this.scale)
        this.d3 = d3Service.getD3();
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string }>();
        this.data$.asObservable().distinct().subscribe(complexData => {
            let data = <any>complexData.initiative;
            this.update(data)
        })
    }

    ngOnInit() {
        this.init();
    }

    init() {

        // this.counter++;
        // console.log("counter", this.counter);

        // if (this.counter > 1) {
        //     return;
        // }
        let d3 = this.d3;

        let svg: any = d3.select("svg"),
            margin = this.margin,
            diameter = +this.width,
            g = svg.append("g").attr("transform", `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`),
            definitions = svg.append("svg:defs");

        let zooming = d3.zoom().on("zoom", zoomed);

        try {
            // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
            // svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2, diameter / 2));
            svg.call(zooming.transform, d3.zoomIdentity.translate(this.translateX, this.translateY).scale(this.scale));
            svg.call(zooming);
        }
        catch (error) {

        }

        function zoomed() {
            // console.log(d3.event.transform)
            let transform = d3.event.transform;
            location.hash = `x=${transform.x}&y=${transform.y}&scale=${transform.k}`
            g.attr("transform", d3.event.transform);
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

        this.fontSize$.subscribe((fs: number) => {
            svg.attr("font-size", fs + "px");
        });

        this.svg = svg;
        this.g = g;
        this.definitions = definitions;
    }


    ngOnDestroy() {
        console.log("circle destroy")
        if (this.zoomSubscription) {
            this.zoomSubscription.unsubscribe();
        }
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
    }

    draw() {

    }

    update(data: any) {
        console.log("update")
        let d3 = this.d3;
        let svg = this.svg;
        let g = this.g;
        let definitions = this.definitions;
        let diameter = this.width;
        let margin = this.margin;
        let colorService = this.colorService;
        let CIRCLE_RADIUS = this.CIRCLE_RADIUS;
        let datasetId = this.datasetId;
        let userFactory = this.userFactory;
        let router = this.router;
        let uiService = this.uiService;
        let showDetailsOf$ = this.showDetailsOf$;
        let addInitiative$ = this.addInitiative$;
        let removeInitiative$ = this.removeInitiative$;
        let TRANSITION_DURATION = 1000;

        let slug = data.getSlug();

        let pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(20)

        let root = data;

        root = d3.hierarchy(data)
            .sum(function (d: any) { return 1 }) // all nodes have the same initial size
            .sort(function (a, b) { return b.value - a.value });

        let depth = 0;
        root.eachAfter(function (n: any) {
            depth = (depth > n.depth) ? depth : n.depth;
        })
        let color = colorService.getDefaulColorRange(depth);

        let focus = root,
            nodes = pack(root).descendants(),
            view: any;


        definePatterns();
        let path = getPaths();
        let t = d3.transition(null).duration(TRANSITION_DURATION);

        console.log(nodes)

        let selection = g.selectAll(".nodes").data(nodes, function (d: any) { return d.data.id });

        let exit = selection
            .exit()
            .style("fill-opacity", 1)
            .transition(t)
            .style("fill-opacity", 1e-6)
            .remove();

        let enter = selection.enter().append("g").attr("class", "nodes");

        enter.append("circle")
            .attr("r", function (d: any) { return d.r })
            .attr("class", function (d: any) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function (d: any) { return d.children ? (d === root ? "white" : color(d.depth)) : (d.parent === root && !d.children ? color(d.depth) : "white"); })
            .style("stroke", function (d: any) { return d.data.isSearchedFor ? "#d9831f" : "none" })
            .style("stroke-width", function (d: any) { return d.data.isSearchedFor ? 3 : "none" })
            .attr("id", function (d: any) { return d.data.id; })

        enter
            .filter(function (d: any) { return d.children && d !== root; })
            .append("text")
            .attr("class", "with-children")
            .attr("id", function (d: any) { return d.data.id; })
            .append("textPath")
            .attr("xlink:href", function (d: any) { return "#path" + d.data.id; })
            .attr("startOffset", function (d: any, i: number) { return "10%"; })
            .on("click", function (d: any, i: number) {
                showDetails(d, d.parent, d3.event, datasetId);
                d.isTooltipVisible = !d.isTooltipVisible;
            })
            .text(function (d: any) { return d.data.name; })

        enter
            .filter(function (d: any) { return !d.children && d !== root; })
            .append("text")
            .attr("class", "without-children")
            .attr("id", function (d: any) { return d.data.id; })
            .attr("dy", 0)
            .attr("x", function (d: any) { return -d.r * .85 })
            .attr("y", function (d: any) { return -d.r * .2 })
            .text(function (d: any) { return d.data.name; })
            .on("click", function (d: any, i: number) {
                showDetails(d, d.parent, d3.event, datasetId);
                d.isTooltipVisible = !d.isTooltipVisible;
            })
            .each(function (d: any) {
                uiService.wrap(d3.select(this), d.data.name, d.r * 2 * 0.95);
            })

        enter.append("circle")
            .attr("fill", "url(#add-icon)")
            .attr("r", CIRCLE_RADIUS * 0.5)
            .attr("id", function (d: any) { return "add" + d.data.name; })
            .attr("cx", function (d: any) { return -10 })
            .attr("cy", function (d: any) { return d.children ? -d.r : 0 })
            .on("mouseover", function (d: any) {
                d3.select(this).classed("show", true)
            })
            .on("mouseout", function (d: any) {
                d3.select(this).classed("show", false)
            })
            .on("click", function (d: any) {
                addInitiativeTo(d)
            });

        enter.append("circle")
            .attr("fill", "url(#remove-icon)")
            .attr("r", CIRCLE_RADIUS * 0.5)
            .attr("id", function (d: any) { return "remove" + d.data.name; })
            .attr("cx", function (d: any) { return +10 })
            .attr("cy", function (d: any) { return d.children ? -d.r : 0 })
            .on("click", function (d: any) {
                removeInitiative(d)
            });

        selection = enter.merge(selection);

        zoomTo([root.x, root.y, root.r * 2 + margin], parseInt(root.id));

        function zoomTo(v: any, index: number) {

            let k = diameter / v[2]; view = v;

            selection
                .transition().duration(TRANSITION_DURATION)
                .attr("transform", function (d: any) {
                    return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"
                });

            selection.select("circle")
                .attr("r", function (d: any) { return d.r * k; })
                ;

            path.attr("d", function (d: any, i: number) {
                let radius = d.r * k + 3;
                return uiService.getCircularPath(radius, -radius, 0);
            })

            // circle
            //     .attr("cx", function (d: any) { return d.cx })
            //     .attr("cy", function (d: any) { return d.cy })


            d3.selectAll("circle.with-children")
                .attr("cx", function (d: any) { return Math.cos(Math.PI - Math.PI * 36 / 180) * d.r - 20 })
                .attr("cy", function (d: any) { return - Math.sin(Math.PI - Math.PI * 36 / 180) * d.r + 10 })

        }

        function addInitiativeTo(node: any) {
            console.log("adding initiative under", node.data.name)
            addInitiative$.next(node.data);
        }

        function removeInitiative(node: any) {
            console.log("remove initiative", node.data.name)
            removeInitiative$.next(node.data);
        }

        function showDetails(d: any, parent: any, event: any, datasetId: string) {
            showDetailsOf$.next(d.data);
        }

        function getPaths() {
            return definitions.selectAll("path")
                .data(nodes)
                .enter()
                .append("path")
                .attr("id", function (d: any) { return "path" + d.data.id; });
        }

        function definePatterns() {

            definitions.selectAll("pattern")
                .data(nodes)
                .exit().remove()
                .enter()
                .filter(function (d: any) { return d.data.accountable })
                .append("pattern")
                .attr("id", function (d: any) { return "image" + d.data.id; })
                .attr("width", "100%")
                .attr("height", "100%")
                .append("image")
                .attr("width", CIRCLE_RADIUS * 2)
                .attr("height", CIRCLE_RADIUS * 2)
                .attr("xlink:href", function (d: any) {
                    // if(d.data.accountable) console.log(d.data.id, d.data.name, d.data.accountable.user_id, d.data.accountable.name, d.data.accountable.picture)
                    return d.data.accountable.picture;
                });

            definitions
                .append("pattern")
                .attr("id", "add-icon")
                .attr("width", "100%")
                .attr("height", "100%")
                .append("image")
                .attr("width", CIRCLE_RADIUS)
                .attr("height", CIRCLE_RADIUS)
                .attr("xlink:href", "/assets/images/plus.png")

            definitions
                .append("pattern")
                .attr("id", "remove-icon")
                .attr("width", "100%")
                .attr("height", "100%")
                .append("image")
                .attr("width", CIRCLE_RADIUS)
                .attr("height", CIRCLE_RADIUS)
                .attr("xlink:href", "/assets/images/minus.png")
        }
    }

    // draw() {
    //     let d3 = this.d3;
    //     let colorService = this.colorService;
    //     let uiService = this.uiService;
    //     let width = this.width;
    //     let zoom$ = this.zoom$;
    //     let fontSize$ = this.fontSize$;
    //     let marginSize = this.margin
    //     let datasetId = this.datasetId;
    //     let CIRCLE_RADIUS = 15;
    //     let router = this.router;
    //     let userFactory = this.userFactory;
    //     let showDetailsOf$ = this.showDetailsOf$;
    //     let addInitiative$ = this.addInitiative$;
    //     let removeInitiative$ = this.removeInitiative$;
    //     let translateX = this.translateX;
    //     let translateY = this.translateY;
    //     let scale = this.scale;

    //     let svg: any = d3.select("svg"),
    //         margin = marginSize,
    //         diameter = +width

    //     let g = svg.append("g")
    //         .attr("transform", `translate(${translateX}, ${translateY}) scale(${scale})`)
    //     // , transform = d3.zoomIdentity

    //     let zooming = d3.zoom().on("zoom", zoomed);

    //     try {
    //         // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
    //         // svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2, diameter / 2));
    //         svg.call(zooming.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
    //         svg.call(zooming);
    //     }
    //     catch (error) {

    //     }

    //     function zoomed() {
    //         // console.log(d3.event.transform)
    //         let transform = d3.event.transform;
    //         location.hash = `x=${transform.x}&y=${transform.y}&scale=${transform.k}`
    //         g.attr("transform", d3.event.transform);
    //     }

    //     this.zoomSubscription = zoom$.subscribe((zf: number) => {
    //         try {
    //             // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
    //             if (zf) {
    //                 zooming.scaleBy(svg, zf);
    //             }
    //             else {
    //                 svg.call(zooming.transform, d3.zoomIdentity.translate(translateX, translateY));
    //             }
    //         }
    //         catch (error) {

    //         }
    //     })

    //     fontSize$.subscribe((fs: number) => {
    //         svg.attr("font-size", fs + "px")
    //     });




    //     this.data$.asObservable().subscribe(complexData => {
    //         console.log("received", complexData)
    //         let data = <any>complexData.initiative;

    //         if (!data) {
    //             uiService.clean();
    //             return;
    //         }
    //         updateVis(data)

    //     })
    // }
}