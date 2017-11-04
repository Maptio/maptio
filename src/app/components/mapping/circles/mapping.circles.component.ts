import { Observable, Subject } from "rxjs/Rx";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Component, OnInit, Input, ViewEncapsulation, EventEmitter, Output, ChangeDetectorRef } from "@angular/core";
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
    public zoom$: Observable<number>;
    public isReset$: Subject<boolean>
    public fontSize$: Observable<number>;
    public data$: Subject<{ initiative: Initiative, datasetId: string }>;

    public showDetailsOf$: Subject<Initiative> = new Subject<Initiative>();
    public addInitiative$: Subject<Initiative> = new Subject<Initiative>();
    public removeInitiative$: Subject<Initiative> = new Subject<Initiative>();

    private zoomSubscription: Subscription;
    private dataSubscription: Subscription;
    private resetSubscription: Subscription;

    private counter: number = 0;
    private svg: any;
    private g: any;
    private definitions: any;

    CIRCLE_RADIUS: number = 15;

    constructor(public d3Service: D3Service, public colorService: ColorService,
        public uiService: UIService, public router: Router,
        private userFactory: UserFactory, private cd: ChangeDetectorRef) {
        // console.log("setup", this.translateX, this.translateY, this.scale)
        this.d3 = d3Service.getD3();
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string }>();
        this.dataSubscription = this.data$.asObservable().distinct().subscribe(complexData => {
            let data = <any>complexData.initiative;
            this.update(data)
        })
    }

    ngOnInit() {
        this.init();
    }

    init() {
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

        this.resetSubscription = this.isReset$.asObservable().filter(r => r).subscribe(isReset => {
            svg.call(zooming.transform, d3.zoomIdentity.translate(761, 761));
        })

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
        if (this.zoomSubscription) {
            this.zoomSubscription.unsubscribe();
        }
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
        if (this.resetSubscription) {
            this.resetSubscription.unsubscribe();
        }
    }

    selectedNode: Initiative;

    selectInitiative(node: Initiative) {
        // console.log("clicked on ", node)
        this.selectedNode = node;
        this.cd.markForCheck();
    }

    edit(node: Initiative) {
        // console.log("editing ", node)
        this.showDetailsOf$.next(node);
    }

    add(node: Initiative) {
        console.log("adding to", node.name)
        this.addInitiative$.next(node);
    }

    remove(node: Initiative) {
        console.log("removing ", node.name, node.id)
        this.removeInitiative$.next(node);
    }

    update(data: any) {
        // console.log("update")
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
        let TRANSITION_DURATION = 750;
        let selectInitiative = this.selectInitiative.bind(this);

        let slug = data.getSlug();

        let pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(20)

        let root = data;

        root = d3.hierarchy(data)
            .sum(function (d: any) { return 1; }) // all nodes have the same initial size
            .sort(function (a, b) { return b.value - a.value });

        let depth = 0;
        root.eachAfter(function (n: any) {
            depth = (depth > n.depth) ? depth : n.depth;
        })
        let color = colorService.getDefaulColorRange(depth);

        let focus = root,
            nodes = pack(root).descendants(),
            view: any;

        let t = d3.transition(null).duration(TRANSITION_DURATION);


        console.log(nodes)
        let selection = g.selectAll(".nodes").data(nodes, function (d: any) { return d.data.id })
            .classed("with-children", function (d: any) { return d.children && d !== root; })
            .classed("without-children", function (d: any) { return !d.children && d !== root; })

        let enter = selection.enter().append("g").attr("class", "nodes")
            .attr("class", "nodes")
            .attr("id", function (d: any) { return d.data.id; })
            .classed("with-children", function (d: any) { return d.children && d !== root; })
            .classed("without-children", function (d: any) { return !d.children && d !== root; })

        let exit = selection
            .exit()
            .remove();


        enter.append("circle")
            .attr("r", function (d: any) { return d.r })
            .attr("class", function (d: any) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("stroke", function (d: any) { return d.data.isSearchedFor ? "#d9831f" : "none" })
            .style("stroke-width", function (d: any) { return d.data.isSearchedFor ? 3 : "none" })
            .attr("id", function (d: any) { return d.data.id; })
            .on("click", function (d: any) {
                selectInitiative(d.data);
                let circleClicked = d3.select(this);
                d3.select(`div.tooltip`)
                    .style("opacity", "1")
                    .style("top", (d3.event.pageY) + "px").style("left", (d3.event.pageX) + "px")
                    .on("mouseenter", function () {
                        circleClicked.style("fill", "#E44519")
                        d3.select(this).style("opacity", "1")
                    })
                    .on("mouseleave", function () {
                        circleClicked.style("fill", "#E44519")
                        d3.select(this).style("opacity", "0")
                    })
                d3.select(this).style("fill", "#E44519")
                // d3.select(`foreignObject.editing[data-id="${d.data.id}"]`).classed("show", true)
            })
            // .on("mousemove", function () { d3.select(`div.tooltip`).style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"); })
            .on("mouseleave", function (d: any) {
                d3.select(`div.tooltip`).style("opacity", "0");
                d3.select(this).style("fill", function (d: any) { return d.children ? (d === root ? "white" : color(d.depth)) : (d.parent === root && !d.children ? color(d.depth) : "white"); })
            });

        enter.select("circle.node")
            .style("fill", "#E44519")
            .transition(t)
            .style("fill", function (d: any) { return d.children ? (d === root ? "white" : color(d.depth)) : (d.parent === root && !d.children ? color(d.depth) : "white"); })
        selection.select("circle.node")
            .style("fill", function (d: any) { return d.children ? (d === root ? "white" : color(d.depth)) : (d.parent === root && !d.children ? color(d.depth) : "white"); })

        enter.append("text")
            .classed("with-children", function (d: any) { return d.children && d !== root; })
            .classed("without-children", function (d: any) { return !d.children && d !== root; })
        selection.select("text")
            .classed("with-children", function (d: any) { return d.children && d !== root; })
            .classed("without-children", function (d: any) { return !d.children && d !== root; })

        let joinWithoutChildren = g.selectAll("g.without-children").data(nodes.filter(function (d: any) { return !d.children && d !== root; }))
        console.log(joinWithoutChildren)
        // joinWithoutChildren.exit().selectAll("textPath").remove();

        joinWithoutChildren.enter()
            .append("text")

        joinWithoutChildren
            .select("text")
            .attr("dy", 0)
            .attr("x", function (d: any) { return -d.r * .85 })
            .attr("y", function (d: any) { return -d.r * .2 })
            .text(function (d: any) { return d.data.name; })
            .on("click", function (d: any, i: number) {
                showDetails(d);
            })
            .each(function (d: any) {
                uiService.wrap(d3.select(this), d.data.name, d.r * 2 * 0.95);
            });

        let joinWithChildren = g.selectAll("g.with-children").data(nodes.filter(function (d: any) { return d.children && d !== root; }))

        // joinWithChildren.exit().selectAll("tspan").remove();
        joinWithChildren.enter()
            .append("text")
        joinWithChildren
            .select("text")
            .attr("x", 0)
            .attr("y", 0)
            .html(function (d: any) {
                return `<textPath xlink:href="#path${d.data.id}" startOffset="10%">${d.data.name || ""}</textPath>`
            })
            .on("click", function (d: any, i: number) {
                showDetails(d);
            })


        // let joinCircleAccountable = g.selectAll("g.nodes").data(nodes);
        // joinCircleAccountable.enter().append("circle").attr("class", "accountable")

        // joinCircleAccountable.select("circle.accountable")
        //     // .attr("class", "accountable")
        enter.append("circle")
            .attr("class", "accountable")
            .attr("r", CIRCLE_RADIUS)
            .attr("cx", function (d: any) {
                return d.children
                    ? Math.cos(Math.PI - Math.PI * 36 / 180) * (d.r + 3) - 20
                    : 0
            })
            .attr("cy", function (d: any) {
                return d.children
                    ? - Math.sin(Math.PI - Math.PI * 36 / 180) * (d.r + 3) + 10
                    : -d.r * 0.70
            })
            .attr("fill", function (d: any) { return "url(#image" + d.data.id + ")" })
            .attr("xlink:href", function (d: any) { return "#path" + d.data.id; })
            .on("click", function (d: any) {
                if (d.data.accountable) {
                    // TODO : keep until migration of database towards shortids
                    if (!d.data.accountable.shortid) {
                        userFactory.get(d.data.accountable.user_id)
                            .then(u => d.data.accountable.shortid = u.shortid)
                            .then(() => { router.navigateByUrl(`/summary/map/${datasetId}/${slug}/u/${d.data.accountable.shortid}/${d.data.accountable.getSlug()}`) })
                    }
                    router.navigateByUrl(`/summary/map/${datasetId}/${slug}/u/${d.data.accountable.shortid}/${d.data.accountable.getSlug()}`)
                }

            })
        // .merge(selection);

        selection.select("circle.accountable")
            .attr("cx", function (d: any) {
                return d.children
                    ? Math.cos(Math.PI - Math.PI * 36 / 180) * (d.r + 3) - 20
                    : 0
            })
            .attr("cy", function (d: any) {
                return d.children
                    ? - Math.sin(Math.PI - Math.PI * 36 / 180) * (d.r + 3) + 10
                    : -d.r * 0.70
            })
            .attr("fill", function (d: any) { return "url(#image" + d.data.id + ")" })
            .attr("xlink:href", function (d: any) { return "#path" + d.data.id; })
        // selection.select("circle.accountable").exit().remove();

        selection = enter.merge(selection);

        let paths = definitions.selectAll("path").data(nodes, function (d: any) { return d.data.id });
        paths
            .attr("id", function (d: any) { return `path${d.data.id}`; })
            .attr("d", function (d: any, i: number) {
                let radius = d.r + 3;
                return uiService.getCircularPath(radius, -radius, 0);
            })
        paths.enter().append("path")
            .attr("id", function (d: any) { return `path${d.data.id}`; })
            .attr("d", function (d: any, i: number) {
                let radius = d.r + 3;
                return uiService.getCircularPath(radius, -radius, 0);
            })

        paths.exit().remove();

        let patterns = definitions.selectAll("pattern").data(nodes, function (d: any) { return d.data.id });
        let enterPatterns = patterns.enter().append("pattern")

        enterPatterns.merge(patterns).filter(function (d: any) { return d.data.accountable })
            .attr("id", function (d: any) { return "image" + d.data.id; })
            .attr("width", "100%")
            .attr("height", "100%")
            .append("image")
            .attr("width", CIRCLE_RADIUS * 2)
            .attr("height", CIRCLE_RADIUS * 2)
            .attr("xlink:href", function (d: any) {
                return d.data.accountable.picture;
            })
        patterns.exit().remove();

        zoomTo([root.x, root.y, root.r * 2 + margin], parseInt(root.id));

        function zoomTo(v: any, index: number) {

            let k = diameter / v[2]; view = v;

            selection
                .transition().duration(TRANSITION_DURATION)
                .attr("transform", function (d: any) {
                    // console.log(d.data.id, d.data.name, d.x, d.y,"translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")")
                    return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"
                });

            selection.select("circle")
                .attr("r", function (d: any) { return d.r * k; })
                ;

        }

        function showDetails(d: any) {
            showDetailsOf$.next(d.data);
        }

        function definePatterns() {
            // console.log("defined patterns")
            definitions.selectAll("pattern")
                .data(nodes)
                .enter().merge(definitions)
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
}