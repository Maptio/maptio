import { UserFactory } from "./../../../shared/services/user.factory";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Component, OnInit, Input, ViewEncapsulation } from "@angular/core";
import { D3Service, D3 } from "d3-ng2-service";
import { ColorService } from "../../../shared/services/ui/color.service"
import { UIService } from "../../../shared/services/ui/ui.service"
import { IDataVisualizer } from "../mapping.interface"
import { Observable } from "rxjs/Rx";

@Component({
    selector: "tree",
    template: require("./mapping.tree.component.html"),
    styleUrls: ["./mapping.tree.component.css"],
    encapsulation: ViewEncapsulation.None
})
export class MappingTreeComponent implements OnInit, IDataVisualizer {
    private d3: D3;
    public width: number;

    public datasetId: string;

    public height: number;

    public margin: number;

    public zoom$: Observable<number>
    public fontSize$: Observable<number>

    private zoomSubscription: Subscription;

    constructor(public d3Service: D3Service, public colorService: ColorService, public uiService: UIService, public router: Router, private userFactory: UserFactory) {
        this.d3 = d3Service.getD3();
    }


    ngOnInit() {
    }

    ngOnDestroy() {
        if (this.zoomSubscription) {
            this.zoomSubscription.unsubscribe();
        }
    }

    draw(data: any) {
        let d3 = this.d3;
        let colorService = this.colorService;
        let uiService = this.uiService;
        let CIRCLE_RADIUS = 15;
        let viewerWidth = this.width;
        let viewerHeight = this.height;
        let zoom$ = this.zoom$;
        let fontSize$ = this.fontSize$;
        let datasetId = this.datasetId;
        let router = this.router;
        let userFactory = this.userFactory;

        if (!data) {
            // console.log("CLEAN");
            this.uiService.clean();
            return;
        }

        this.uiService.clean();
        // let color = colorService.getDefaulColorRange();

        let margins = { top: 0, right: this.margin, bottom: this.margin, left: this.margin }

        // declares a tree layout and assigns the size
        // CAREFUL : width and height are reversed in this function
        let treemap = d3.tree().size([viewerWidth / 2, viewerHeight]);

        function zoomed() {
            g.attr("transform", d3.event.transform);
        }



        let zooming = d3.zoom().on("zoom", zoomed);

        let svg: any = d3.select("svg").attr("width", viewerWidth)
            .attr("height", viewerHeight).attr("class", "overlay");

        fontSize$.subscribe((fs: number) => {
            svg.attr("font-size", fs + "px")
        })

        let g = svg.append("g")

            .attr("transform",
            "translate(" + margins.left + "," + margins.top + ")"), transform = d3.zoomIdentity

        try {
            // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
            svg.call(zooming.transform, d3.zoomIdentity.translate(margins.left, 0));
            svg.call(zooming);
        }
        catch (error) {

        }

        this.zoomSubscription = zoom$.subscribe((zf: number) => {
            try {
                // the zoom generates an DOM Excpetion Error 9 for Chrome (not tested on other browsers yet)
                if (zf) {
                    zooming.scaleBy(svg, zf);
                }
                else {
                    svg.call(zooming.transform, d3.zoomIdentity.translate(margins.left, 0));
                }
            }
            catch (error) {

            }
        })

        let i = 0,
            duration = 750,
            root: any;


        // Assigns parent, children, height, depth
        root = d3.hierarchy(data, function (d) { return d.children; });
        root.x0 = viewerHeight;
        root.y0 = 0;

        let depth = 0;
        root.eachAfter(function (n: any) {
            depth = (depth > n.depth) ? depth : n.depth;
        })
        let color = colorService.getDefaulColorRange(depth);

        // Collapse after the second level
        // root.children.forEach(collapse);

        update(root, duration);



        // Collapse the node and all it's children
        function collapse(d: any) {
            if (d.children) {
                d._children = d.children
                d._children.forEach(collapse)
                d.children = null
            }
        }

        function update(source: any, duration: number) {

            // Assigns the x and y position for the nodes
            let treeData = treemap(root);

            // Compute the new tree layout.
            let nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) { d.y = d.depth * 180 });

            // ****************** Nodes section ***************************

            // Update the nodes...
            let node = g.selectAll("g.node")
                .data(nodes, function (d: any) { return d.id || (d.id = ++i); });

            let definitions = g.append("defs")
            definitions.selectAll("pattern")
                .data(nodes)
                .enter()
                .append("pattern")
                .attr("id", function (d: any) { return "image" + d.data.id; })
                .attr("width", "100%")
                .attr("height", "100%")
                .append("image")
                .attr("width", CIRCLE_RADIUS * 2)
                .attr("height", CIRCLE_RADIUS * 2)
                .attr("xlink:href", function (d: any) { return d.data.accountable ? d.data.accountable.picture : ""; })
                ;


            // Enter any new modes at the parent's previous position.
            let nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function (d: any) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on("click", click);


            // Add Circle for the nodes
            nodeEnter.append("circle")
                .attr("class", "node")
                .attr("r", 1e-4)
                .attr("fill", function (d: any) { return d.data.accountable ? "url(#image" + d.data.id + ")" : (d.children ? color(d.depth) : "#fff") })
                .style("stroke", function (d: any) {
                    return color(d.depth)
                })
                ;


            // Add labels for the nodes
            nodeEnter.append("text")
                .attr("class", "name")
                .attr("dy", "0.65em")
                .attr("y", "1.65em")
                .attr("x", CIRCLE_RADIUS)
                .text(function (d: any) { return d.data.name; })
                .each(function (d: any) {
                    uiService.wrap(d3.select(this), d.data.name, d.y / d.depth * 0.85);
                });

            nodeEnter.append("text")
                .attr("class", "accountable")
                .attr("dy", "5")
                .attr("x", CIRCLE_RADIUS + 4)
                .text(function (d: any) { return d.data.accountable ? d.data.accountable.name : ""; })
                .on("click", function (d: any) {
                    if (d.data.accountable) {
                        // HACK : until migration of database towards shortids
                        if (!d.data.accountable.shortid) {
                            userFactory.get(d.data.accountable.user_id)
                                .then(u => d.data.accountable.shortid = u.shortid)
                                .then(() => { router.navigateByUrl(`/summary/map/${datasetId}/u/${d.data.accountable.shortid}`) })
                        }
                        router.navigateByUrl(`/summary/map/${datasetId}/u/${d.data.accountable.shortid}`)
                    }

                })


            // UPDATE
            let nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function (d: any) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Update the node attributes and style
            nodeUpdate.select("circle.node")
                .attr("r", 15)
                .attr("fill", function (d: any) { return d.data.accountable ? "url(#image" + d.data.id + ")" : (d._children ? color(d.depth) : "#fff") })
                .style("stroke", function (d: any) {
                    return color(d.depth)
                })
                .attr("cursor", "pointer");


            // Remove any exiting nodes
            let nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d: any) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select("circle")
                .attr("r", 1e-6);

            // On exit reduce the opacity of text labels
            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // ****************** links section ***************************

            // Update the links...
            let link = g.selectAll("path.link")
                .data(links, function (d: any) { return d.id; });

            // Enter any new links at the parent's previous position.
            let linkEnter = link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function (d: any) {
                    let o = { x: source.x0, y: source.y0 }
                    return diagonal(o, o)
                });

            // UPDATE
            let linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr("d", function (d: any) { return diagonal(d, d.parent) });

            // Remove any exiting links
            link.exit().transition()
                .duration(duration)
                .attr("d", function (d: any) {
                    let o = { x: source.x, y: source.y }
                    return diagonal(o, o)
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function (d: any) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s: any, d: any) {

                let path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

                return path
            }

            // Toggle children on click.
            function click(d: any) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d, duration);
                // centerNode(d)
            }
        }
    }
}