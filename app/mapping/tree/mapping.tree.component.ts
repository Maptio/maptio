import { Component, OnInit, Input } from '@angular/core';
import {
    D3Service, D3, Selection,
    PackLayout, HierarchyNode, HierarchyCircularNode,
    Transition, Timer, BaseType
} from 'd3-ng2-service';
import { ColorService } from '../../services/color.service'
import { UIService } from '../../services/ui.service'
import { IDataVisualizer } from '../mapping.interface'

@Component({
    selector: 'tree',
    templateUrl: 'mapping.tree.component.html',
    styles: [require('./mapping.tree.component.css').toString()],
})
export class MappingTreeComponent implements OnInit, IDataVisualizer {
    private d3: D3;


    public width:number;

    public height:number;

    public margin:number;

    constructor(public d3Service: D3Service, public colorService: ColorService, public uiService: UIService) {
        this.d3 = d3Service.getD3();
    }


    ngOnInit() {
    }

    draw(data: any) {
        let d3 = this.d3;

        this.uiService.clean();

        console.log("TREE WIDTH " + this.width + "HEIGHT " + this.height + "MARGIN " + this.margin);

        var marginDimensions = { top: this.margin, right: this.margin, bottom: this.margin, left: this.margin*5 };
            // width = width - marginDimensions.left - marginDimensions.right,
            // height = height - marginDimensions.top - marginDimensions.bottom;
// console.log(" WIDTH " + width + "HEIGHT " + height );

        // append the svg object to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg = d3.select("svg")
             .attr("width", this.width + marginDimensions.right + marginDimensions.left)
             .attr("height", this.height + marginDimensions.top + marginDimensions.bottom)
            .append("g")
            .attr("transform", "translate("
            + marginDimensions.left + "," + marginDimensions.top + ")");


        // append the svg object to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        // var svg = d3.select("svg")
        //     .attr("width", width )
        //     .attr("height", height)
        //     .append("g")
        //     .attr("transform", "translate("
        //     + margin + "," + margin + ")");

        var i = 0,
            duration = 750,
            root: any;

        // declares a tree layout and assigns the size
        var treemap = d3.tree().size([this.height, this.width]);

        // Assigns parent, children, height, depth
        root = d3.hierarchy(data, function (d) { return d.children; });
        root.x0 = (this.height) / 2;
        root.y0 = 0;

        // Collapse after the second level
        //root.children.forEach(collapse);

        update(root);

        // Collapse the node and all it's children
        function collapse(d: any) {
            if (d.children) {
                d._children = d.children
                d._children.forEach(collapse)
                d.children = null
            }
        }

        function update(source: any) {

            // Assigns the x and y position for the nodes
            var treeData = treemap(root);

            // Compute the new tree layout.
            var nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) { d.y = d.depth * 180 });

            // ****************** Nodes section ***************************

            // Update the nodes...
            var node = svg.selectAll('g.node')
                .data(nodes, function (d: any) { return d.id || (d.id = ++i); });

            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr("transform", function (d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('click', click);

            // Add Circle for the nodes
            nodeEnter.append('circle')
                .attr('class', 'node')
                .attr('r', 1e-6)
                .style("fill", function (d) {
                    return d.children ? "lightsteelblue" : "#fff";
                });

            // Add labels for the nodes
            nodeEnter.append('text')
                .attr("dy", ".35em")
                .attr("x", function (d) {
                    return d.children || d.children ? -13 : 13;
                })
                .attr("text-anchor", function (d) {
                    return d.children || d.children ? "end" : "start";
                })
                .text(function (d: any) { return d.data.name; });

            // UPDATE
            var nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Update the node attributes and style
            nodeUpdate.select('circle.node')
                .attr('r', 10)
                .style("fill", function (d) {
                    return d.children ? "lightsteelblue" : "#fff";
                })
                .attr('cursor', 'pointer');


            // Remove any exiting nodes
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select('circle')
                .attr('r', 1e-6);

            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);

            // ****************** links section ***************************

            // Update the links...
            var link = svg.selectAll('path.link')
                .data(links, function (d: any) { return d.id; });

            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert('path', "g")
                .attr("class", "link")
                .attr('d', function (d) {
                    var o = { x: source.x0, y: source.y0 }
                    return diagonal(o, o)
                });

            // UPDATE
            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function (d) { return diagonal(d, d.parent) });

            // Remove any exiting links
            var linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function (d) {
                    var o = { x: source.x, y: source.y }
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

                var path = `M ${s.y} ${s.x}
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
                update(d);
            }
        }
    }
}