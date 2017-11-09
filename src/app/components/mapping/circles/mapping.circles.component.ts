import { Observable, Subject } from "rxjs/Rx";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Component, OnInit, Input, ViewEncapsulation, EventEmitter, Output, ChangeDetectorRef } from "@angular/core";
import { D3Service, D3, HierarchyCircularNode, ScaleLinear, HSLColor, Transition } from "d3-ng2-service";
import { ColorService } from "../../../shared/services/ui/color.service"
import { UIService } from "../../../shared/services/ui/ui.service"
import { IDataVisualizer } from "../mapping.interface"
import { UserFactory } from "../../../shared/services/user.factory";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2/dist";

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
    public isLocked$: Observable<boolean>;
    public data$: Subject<{ initiative: Initiative, datasetId: string }>;
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

    public analytics: Angulartics2Mixpanel;

    private counter: number = 0;
    private svg: any;
    private g: any;
    private definitions: any;
    public isWaitingForDestinationNode: boolean = false;
    public isTooltipDescriptionVisible: boolean = false;
    public isFirstEditing: boolean = false;
    public isLocked: boolean;

    public selectedNode: Initiative;
    public selectedNodeParent: Initiative;
    public hoveredNode: Initiative;

    private cutNode: Initiative;
    private cutNodeParent: Initiative;

    private draggedNode: Initiative;
    private dragTargetNode: Initiative;
    private isDragging: boolean = false;

    private color: ScaleLinear<HSLColor, string>;

    CIRCLE_RADIUS: number = 15;
    MAX_TEXT_LENGTH = 30;
    TRANSITION_DURATION = 2250;
    TRANSITION_OPACITY = 750;
    RATIO_FOR_VISIBILITY = 0.08;
    OPACITY_DISAPPEARING = 0.1;
    T: any;

    constructor(public d3Service: D3Service, public colorService: ColorService,
        public uiService: UIService, public router: Router,
        private userFactory: UserFactory, private cd: ChangeDetectorRef
    ) {
        this.d3 = d3Service.getD3();
        this.T = this.d3.transition(null).duration(this.TRANSITION_DURATION);
        this.data$ = new Subject<{ initiative: Initiative, datasetId: string }>();
        this.dataSubscription = this.data$.asObservable().distinct().subscribe(complexData => {
            let data = <any>complexData.initiative;
            this.datasetId = complexData.datasetId;
            this.rootNode = complexData.initiative;
            this.update(data)
        })
    }

    ngOnInit() {
        this.init();
    }

    init() {
        this.uiService.clean();
        let d3 = this.d3;
        let RATIO_FOR_VISIBILITY = this.RATIO_FOR_VISIBILITY;
        let OPACITY_DISAPPEARING = this.OPACITY_DISAPPEARING;

        let svg: any = d3.select("svg"),
            margin = this.margin,
            diameter = +this.width,
            g = svg.append("g").attr("transform", `translate(${this.translateX}, ${this.translateY}) scale(${this.scale})`),
            definitions = svg.append("svg:defs");

        let zooming = d3.zoom().scaleExtent([0.5, 3]).on("zoom", zoomed);

        try {
            // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
            // svg.call(zooming.transform, d3.zoomIdentity.translate(diameter / 2, diameter / 2));
            svg.call(zooming.transform, d3.zoomIdentity.translate(this.translateX, this.translateY).scale(this.scale));
            svg.call(zooming);
        }
        catch (error) {

        }

        function zoomed() {
            let transform = d3.event.transform;

            location.hash = `x=${transform.x}&y=${transform.y}&scale=${transform.k}`
            g.attr("transform", d3.event.transform);
            d3.selectAll("g.nodes")
                .transition(this.T).duration(this.TRANSITION_OPACITY)
                .style("fill-opacity", function (d: any) {
                    console.log(d.data.name, transform.k, (<any>this).getBBox().width * transform.k, window.outerWidth * 0.5)
                    return (<any>this).getBBox().width * transform.k < window.outerWidth * RATIO_FOR_VISIBILITY ? OPACITY_DISAPPEARING : "1"
                })
            // .each(function (d: any) {
            //     console.log(d.data.name, this, this.getBBox(), this.getBBox().width)
            // })
        }

        this.resetSubscription = this.isReset$.asObservable().filter(r => r).subscribe(isReset => {
            svg.call(zooming.transform, d3.zoomIdentity.translate(761, 761));
        })

        this.zoomSubscription = this.zoom$.subscribe((zf: number) => {
            try {
                // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
                if (zf) {
                    zooming.scaleBy(svg, zf + 0.000001);
                }
                else {
                    svg.call(zooming.transform, d3.zoomIdentity.translate(this.translateX, this.translateY));
                }
            }
            catch (error) {

            }
        })

        this.fontSubscription = this.fontSize$.subscribe((fs: number) => {
            let uiService = this.uiService;
            let MAX_TEXT_LENGTH = this.MAX_TEXT_LENGTH;
            svg.attr("font-size", fs + "px");
            svg.selectAll("text").attr("font-size", fs + "px");

            d3.selectAll("text.without-children")
                .each(function (d: any) {
                    let realText = d.data.name ? (d.data.name.length > MAX_TEXT_LENGTH ? `${d.data.name.substr(0, MAX_TEXT_LENGTH)}...` : d.data.name) : "";
                    uiService.wrap(d3.select(this), realText, d.r * 2 * 0.95);
                });
        });


        this.lockedSubscription = this.isLocked$.subscribe((locked: boolean) => {

            d3.selectAll("circle.node").style("cursor", () => { return locked ? "default" : "move" })

            this.setIsLocked(locked);

        })

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
        if (this.fontSubscription) {
            this.fontSubscription.unsubscribe();
        }
        if (this.lockedSubscription) {
            this.lockedSubscription.unsubscribe();
        }
    }


    selectInitiative(node: Initiative, parent: Initiative) {
        this.selectedNode = node;
        this.selectedNodeParent = parent;
        this.cd.markForCheck();
    }

    hoverInitiative(node: Initiative) {
        this.hoveredNode = node;
        this.cd.markForCheck();
    }

    setDragTargetNode(node: Initiative) {
        // console.log("set dragged target node", node.name)
        this.dragTargetNode = node;
    }

    setDraggedNode(node: Initiative) {
        // console.log("set dragged node", node.name)
        this.draggedNode = node;
    }

    setIsDragging(isDragging: boolean) {
        this.isDragging = isDragging;
    }

    getIsDragging(): boolean {
        return this.isDragging;
    }

    setColor(color: ScaleLinear<HSLColor, string>) {
        this.color = color;
    }

    getColor() {
        return this.color;
    }

    setIsLocked(isLocked: boolean) {
        this.isLocked = isLocked;
    }

    getIsLocked(): boolean {
        return this.isLocked;
    }

    edit(node: Initiative) {
        if (!this.selectedNodeParent) { return }
        this.showDetailsOf$.next(node);
        this.analytics.eventTrack("Edit node", { mode: "map" });
    }

    editQuick(node: Initiative) {
        this.showDetailsOf$.next(node);
        this.analytics.eventTrack("Edit node", { mode: "tooltip" });
    }

    add(node: Initiative) {
        this.addInitiative$.next(node);
        this.analytics.eventTrack("Add node", { mode: "map" });
    }

    addQuick(node: Initiative) {
        this.addInitiative$.next(node);
        this.analytics.eventTrack("Add node", { mode: "tooltip" });
    }

    addFirstNode() {
        this.addInitiative$.next(this.rootNode);
        this.analytics.eventTrack("Add node", { mode: "instruction" });
    }

    remove(node: Initiative) {
        if (!this.selectedNodeParent) { return }
        this.removeInitiative$.next(node);
        this.analytics.eventTrack("Remove node", { mode: "map" });
    }

    removeQuick(node: Initiative) {
        this.removeInitiative$.next(node);
        this.analytics.eventTrack("Remove node", { mode: "tooltip" });
    }

    move() {
        if (!this.draggedNode || !this.dragTargetNode) {
            return;
        }
        this.moveInitiative$.next({ node: this.draggedNode, from: null, to: this.dragTargetNode });
        this.draggedNode = null;
        this.dragTargetNode = null;
        this.analytics.eventTrack("Move node", { mode: "map" });
    }

    update(data: any) {
        if (!this.g) {
            this.init();
        }

        let d3 = this.d3;
        let svg = this.svg;
        let g = this.g;
        let scale = this.scale;
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
        let selectInitiative = this.selectInitiative.bind(this);
        let hoverInitiative = this.hoverInitiative.bind(this);
        let isFirstEditing = this.isFirstEditing;
        let MAX_TEXT_LENGTH = this.MAX_TEXT_LENGTH;
        let TRANSITION_DURATION = this.TRANSITION_DURATION;
        let setDragTargetNode = this.setDragTargetNode.bind(this);
        let setDraggedNode = this.setDraggedNode.bind(this);
        let setIsDragging = this.setIsDragging.bind(this);
        let getIsDragging = this.getIsDragging.bind(this);
        let getColor = this.getColor.bind(this);
        let setColor = this.setColor.bind(this);
        let move = this.move.bind(this);
        let startX: number, startY: number;
        let slug = data.getSlug();
        let getIsLocked = this.getIsLocked.bind(this);
        let t = this.T;
        let RATIO_FOR_VISIBILITY = this.RATIO_FOR_VISIBILITY;
        let OPACITY_DISAPPEARING = this.OPACITY_DISAPPEARING;

        let pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(20)

        let root = data;

        root = d3.hierarchy(data)
            .sum(function (d: any) { return 1; }) // all nodes have the same initial size
            .sort(function (a, b) {
                return b.value - a.value;
            });

        let depth = 0;
        root.eachAfter(function (n: any) {
            depth = (depth > n.depth) ? depth : n.depth;
        })

        setColor(colorService.getDefaulColorRange(depth));

        let focus = root,
            nodes = pack(root).descendants(),
            view: any;
        // console.log(nodes.map((n: any) => { console.log(n.data.id, n) }));
        // for (let index = -1; index <= depth; index++) {
        //     console.log("setup color", index, getColor()(index))

        // }

        this.isFirstEditing = false;
        if (nodes.length === 1) {
            this.isFirstEditing = true;
        }
        svg.on("contextmenu", function () {
            d3.event.preventDefault();
            d3.select("div.tooltip-initiative").style("visibility", "hidden");
            d3.select(`div.tooltip`)
                .style("visibility", "visible")
                .style("opacity", "1")
                .style("top", (d3.event.pageY - 15) + "px").style("left", (d3.event.pageX) + "px");
            selectInitiative(root.data, undefined);
        })
            .on("mouseover", function (d: any) {
                if (getIsDragging()) setDragTargetNode(root.data);
            })


        let selection = g.selectAll(".nodes").data(nodes, function (d: any) { return d.data.id })
            .attr("pointer-events", "auto")
            .classed("with-children", function (d: any) { return d.children && d !== root; })
            .classed("without-children", function (d: any) { return !d.children && d !== root; })
            .attr("ancestors-id", function (d: any) { return d.parent ? d.ancestors().map((a: any) => { if (a.data.id !== d.data.id) return a.data.id; }).join(",") : "" })
            .style("fill-opacity", function (d: any) {
                console.log(d.data.name, scale, (<any>this).getBBox().width * scale, window.outerWidth * 0.5)
                return (<any>this).getBBox().width * scale < window.outerWidth * RATIO_FOR_VISIBILITY ? OPACITY_DISAPPEARING : "1"
            })

        let enter = selection.enter().append("g").attr("class", "nodes")
            .attr("class", "nodes")
            .attr("pointer-events", "auto")
            .attr("id", function (d: any) { return d.data.id; })
            .attr("ancestors-id", function (d: any) { return d.parent ? d.ancestors().map((a: any) => { if (a.data.id !== d.data.id) return a.data.id; }).join(",") : "" })
            .classed("with-children", function (d: any) { return d.children && d !== root; })
            .classed("without-children", function (d: any) { return !d.children && d !== root; })


        selection.order();
        let exit = selection
            .exit()
            .remove();





        g.selectAll("g.nodes")
            .call(
            d3.drag()
                .filter(() => { return !getIsLocked(); })
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
            )




        function dragstarted(d: any) {
            setIsDragging(true)
            // console.log("drag start", getIsDragging())
            setDraggedNode(d.data)

            // if (!d.children) this.parentNode.appendChild(this);

            d3.event.sourceEvent.stopPropagation();
            d3.event.sourceEvent.preventDefault();
            d3.select(this).attr("pointer-events", "none");
            d3.select(this).select("circle.node").classed("dragged", true)
            startX = d3.event.x;
            startY = d3.event.y;

        }

        function dragged(d: any) {
            // console.log("dragging")
            d3.select(this)
                .attr("transform", function (d: any) {
                    return "translate(" + (d3.event.x - diameter / 2) + "," + (d3.event.y - diameter / 2) + ")";
                });

            d3.selectAll(`g.nodes[ancestors-id*="${d.data.id}"]`)
                .attr("transform", function (d: any) {
                    return "translate(" + (d.x - diameter / 2 - (startX - d3.event.x)) + "," + (d.y - diameter / 2 - (startY - d3.event.y)) + ")";
                });
            d3.select(this).select("circle.node").classed("dragged", true)
        }

        function dragended(d: any) {
            // console.log("drag end")
            d3.select(this).select("circle.node").classed("dragged", false)
            if (getIsDragging()) move();
            setIsDragging(false)
        }



        enter.append("circle")
            .attr("r", function (d: any) { return d.children ? d.r : d.r * 10 })
            .attr("class", function (d: any) { return d.parent ? (d.children || d.parent.data.id === root.data.id) ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function (d: any) { return d.children ? (d === root ? "white" : getColor()(d.depth)) : (d.parent && d.parent.data.id === root.data.id ? getColor()(d.depth) : "white"); })
            .classed("invisible", function (d: any) { return !d.parent && !(nodes.length === 1) })
            .style("stroke", function (d: any) { return d.data.isSearchedFor ? "#d9831f" : "none" })
            .style("stroke-width", function (d: any) { return d.data.isSearchedFor ? 3 : "none" })
            .attr("id", function (d: any) { return d.data.id; })
            .style("cursor", () => { return getIsLocked() ? "default" : "move" })
            .on("click", function (d: any) {
                if (d3.event.defaultPrevented) return; // dragged
                if (d.parent) {
                    showDetails(d);
                    d3.select("div.tooltip-initiative").style("visibility", "hidden")
                }
            })
            .on("mouseover", function (d: any) {
                d3.event.stopPropagation();
                if (getIsDragging()) setDragTargetNode(d.data);
                if (d.parent) d3.select(this).classed("highlighted", !getIsLocked() && true);
            })
            .on("contextmenu", function (d: any) {
                d3.select("div.tooltip-initiative").style("visibility", "hidden");
                d3.event.preventDefault();
                selectInitiative(d.data, d.parent ? d.parent.data : undefined);
                let circleClicked = d3.select(this);
                d3.select(`div.tooltip`)
                    .style("visibility", "visible")
                    .style("opacity", "1")
                    .style("top", (d3.event.pageY - 15) + "px").style("left", (d3.event.pageX) + "px")
                    .on("mouseenter", function () {
                        circleClicked.classed("highlighted", true)
                        d3.select(this).style("visibility", "visible").style("opacity", "1")
                    })
                    .on("mouseleave", function () {
                        circleClicked.classed("highlighted", true)
                        d3.select(this).style("visibility", "visible").style("opacity", "0")
                    })
                d3.select(this).classed("highlighted", true);
                d3.event.stopPropagation();
            })
            .on("mouseleave", function (d: any) {
                // for (let index = -1; index <= depth; index++) {
                //     console.log("mouseleave color", index, getColor()(index))

                // }
                d3.select("div.tooltip-initiative").style("visibility", "hidden");
                d3.select(`div.tooltip`).style("visibility", "hidden");
                d3.select(this)
                    .classed("highlighted", false)
                    .style("fill", function (d: any) {
                        // console.log("mouseleave", d.data.id, d.depth, getColor()(d.depth));
                        return d.children ? (d === root ? "white" : getColor()(d.depth)) : (d.parent && d.parent.data.id === root.data.id ? getColor()(d.depth) : "white");
                    })
            })


        enter.selectAll("circle.node")
            .style("fill", "white")
            .transition(t)
            .style("fill", function (d: any) { return d.children ? (d === root ? "white" : getColor()(d.depth)) : (d.parent && d.parent.data.id === root.data.id ? getColor()(d.depth) : "white"); })
            .style("cursor", () => { return getIsLocked() ? "default" : "move" })


        selection.selectAll("circle.node")
            .attr("class", function (d: any) { return d.parent ? (d.children || d.parent.data.id === root.data.id) ? "node" : "node node--leaf" : "node node--root"; })
            .style("cursor", () => { return getIsLocked() ? "default" : "move" })
            .style("fill", function (d: any) { return d.children ? (d === root ? "white" : getColor()(d.depth)) : (d.parent && d.parent.data.id === root.data.id ? getColor()(d.depth) : "white"); })
            .classed("invisible", function (d: any) { return !d.parent && !(nodes.length === 1) })



        enter.append("text")
            .classed("with-children", function (d: any) { return d.children && d !== root; })
            .classed("without-children", function (d: any) { return !d.children && d !== root; })
        selection.select("text")
            .classed("with-children", function (d: any) { return d.children && d !== root; })
            .classed("without-children", function (d: any) { return !d.children && d !== root; })

        let tooltip = d3.select("div.tooltip-initiative");

        let joinWithChildren = g.selectAll("g.with-children").data(nodes.filter(function (d: any) { return d.children && d !== root; }))

        joinWithChildren.enter()
            .append("text")
        joinWithChildren
            .select("text")
            .attr("pointer-events", "auto")
            .attr("x", 0)
            .attr("y", 0)
            .html(function (d: any) {
                return `<textPath xlink:href="#path${d.data.id}" startOffset="10%">${d.data.name || ""}</textPath>`
            })
            .on("click", function (d: any, i: number) {
                if (d3.event.defaultPrevented) return; // dragged
                showDetails(d);
                d3.select("div.tooltip-initiative").style("visibility", "hidden");
            })



        let joinWithoutChildren = g.selectAll("g.without-children").data(nodes.filter(function (d: any) { return !d.children && d !== root; }))


        joinWithoutChildren.enter()
            .append("text")

        joinWithoutChildren
            .select("text")
            .attr("pointer-events", "auto")
            .attr("dy", 0)
            .attr("x", function (d: any) { return -d.r * .9 })
            .attr("y", function (d: any) { return -d.r * .2 })
            .text(function (d: any) { return d.data.name; })
            .on("click", function (d: any, i: number) {
                if (d3.event.defaultPrevented) return; // dragged
                showDetails(d);
                d3.select("div.tooltip-initiative").style("visibility", "hidden");
            })
            .each(function (d: any) {
                let realText = d.data.name ? (d.data.name.length > MAX_TEXT_LENGTH ? `${d.data.name.substr(0, MAX_TEXT_LENGTH)}...` : d.data.name) : "";
                uiService.wrap(d3.select(this), realText, d.r * 2 * 0.95);
            });




        g.selectAll("text")
            .on("mouseover", function (d: any) {
                // setTooltipDescriptionVisible(true)
                hoverInitiative(d.data)
                d3.select("div.tooltip-initiative").style("visibility", "visible")
                    .style("top", (d3.event.pageY - 20) + "px")
                    .style("left", () => { return d3.event.pageX > diameter * 0.90 ? "auto" : (d3.event.pageX) + "px" })
                    .style("right", () => { return d3.event.pageX > diameter * 0.90 ? "0" : "" })

                    .on("mouseenter", function () {
                        d3.select(this).style("visibility", "visible")
                    })
                    .on("mouseleave", function () {
                        d3.select("div.tooltip-initiative").style("visibility", "hidden")
                    })
            })
            .on("mousemove", function (d: any) {
                hoverInitiative(d.data)
                d3.select("div.tooltip-initiative").style("visibility", "visible")
                    .style("top", (d3.event.pageY - 20) + "px")
                    .style("left", () => { return d3.event.pageX > diameter * 0.70 ? "auto" : (d3.event.pageX) + "px" })
                    .style("right", () => { return d3.event.pageX > diameter * 0.70 ? "0" : "" })
                    .on("mouseenter", function () {
                        d3.select(this).style("visibility", "visible")
                    })
                    .on("mouseleave", function () {
                        d3.select(this).style("visibility", "visible")
                    })
            })


        enter.append("circle")
            .attr("class", "accountable")
            .attr("pointer-events", "auto")
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
            .attr("pointer-events", "auto")
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

        let patterns = definitions.selectAll("pattern").data(nodes.filter(function (d: any) { return d.data.accountable }), function (d: any) { return d.data.id });
        let enterPatterns = patterns.enter().filter(function (d: any) { return d.data.accountable }).append("pattern");

        enterPatterns
            .attr("id", function (d: any) { return "image" + d.data.id; })
            .attr("width", "100%")
            .attr("height", "100%")
            .filter(function (d: any) { return d.data.accountable })
            .append("image")
            .attr("width", CIRCLE_RADIUS * 2)
            .attr("height", CIRCLE_RADIUS * 2)
            .attr("xlink:href", function (d: any) {
                return d.data.accountable.picture;
            })

        patterns
            .attr("id", function (d: any) { return "image" + d.data.id; })
            .attr("width", "100%")
            .attr("height", "100%")
            .filter(function (d: any) { return d.data.accountable })
            .select("image")
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
                    return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"
                });

            selection.select("circle")
                .attr("r", function (d: any) { return d.r * k; })
                ;

            d3.selectAll("circle").dispatch("mouseleave");

        }

        function showDetails(d: any) {
            showDetailsOf$.next(d.data);
        }

        function definePatterns() {
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