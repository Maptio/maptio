import { Component, OnInit } from "@angular/core";
import { D3Service, D3 } from "d3-ng2-service";
import { ColorService } from "../../../shared/services/color.service"
import { UIService } from "../../../shared/services/ui.service"
import { IDataVisualizer } from "../mapping.interface"

@Component({
    selector: "tree",
    template: require("./mapping.tree.component.html"),
    styles: [require("./mapping.tree.component.css").toString()],
})
export class MappingTreeComponent implements OnInit, IDataVisualizer {
    private d3: D3;


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

         if (!data) {
            // console.log("CLEAN");
            this.uiService.clean();
            return;
        }

        this.uiService.clean();
        let color = colorService.getDefaulColorRange();

        //console.log("TREE WIDTH " + this.width + "HEIGHT " + this.height + "MARGIN " + this.margin);

        let marginDimensions = { top: this.margin, right: this.margin, bottom: this.margin, left: this.margin * 5 };

        let svg = d3.select("svg"),
            // margin = 50,
            diameter = +this.width,
            g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        let i = 0,
            duration = 750,
            root: any;

        // declares a tree layout and assigns the size
        let treemap = d3.tree().size([this.height - marginDimensions.top - marginDimensions.bottom, this.width - marginDimensions.right - marginDimensions.left]);

        // Assigns parent, children, height, depth
        root = d3.hierarchy(data, function (d) { return d.children; });
        root.x0 = (this.height) / 2;
        root.y0 = 0;

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
            let node = svg.selectAll("g.node")
                .data(nodes, function (d: any) { return d.id || (d.id = ++i); });

            // Enter any new modes at the parent's previous position.
            let nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on("click", click);

            // Add Circle for the nodes
            nodeEnter.append("circle")
                .attr("class", "node")
                .attr("r", 1e-5)
                .style("fill", function (d) {
                    // return d.children ? "lightsteelblue" : "#fff";
                    return d.children ? color(d.depth) : "white";
                })
                .style("stroke", function (d) {
                    // return d.children ? "lightsteelblue" : "#fff";
                    return d.children ? color(d.depth) : "#ccc";
                });

            // Add labels for the nodes
            nodeEnter.append("text")
                .attr("class", "name")
                .attr("dy", "1.65em")
                .attr("x", "15")
                // .attr("x", function (d) {
                //     return d.children || d.children ? -13 : 13;
                // })
                // .attr("text-anchor", function (d) {
                //     return d.children || d.children ? "end" : "start";
                // })
                .text(function (d: any) { return d.data.name; });

            nodeEnter.append("text")
                .attr("class", "accountable")
                .attr("dy", "5")
                .attr("x", "15")
                // .attr("text-anchor", function (d) {
                //     return d.children || d.children ? "end" : "start";
                // })
                .text(function (d: any) { return d.data.accountable ? d.data.accountable.name : ""; });

            // UPDATE
            let nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Update the node attributes and style
            nodeUpdate.select("circle.node")
                .attr("r", 10)
                .style("fill", function (d) {
                    return d.children ? color(d.depth) : "white";  // return d.children ? "lightsteelblue" : "#fff";
                })
                .style("stroke", function (d) {
                    // return d.children ? "lightsteelblue" : "#fff";
                    return d.children ? color(d.depth) : "#ccc";
                })
                .attr("cursor", "pointer");


            // Remove any exiting nodes
            let nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
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
            let link = svg.selectAll("path.link")
                .data(links, function (d: any) { return d.id; });

            // Enter any new links at the parent's previous position.
            let linkEnter = link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function (d) {
                    let o = { x: source.x0, y: source.y0 }
                    return diagonal(o, o)
                });

            // UPDATE
            let linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr("d", function (d) { return diagonal(d, d.parent) });

            // Remove any exiting links
            link.exit().transition()
                .duration(duration)
                .attr("d", function (d) {
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
            }
        }
    }
}