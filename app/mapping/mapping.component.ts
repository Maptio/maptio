import {
  Component,
  AfterViewInit,
  ViewChild,
  OnInit 
} from '@angular/core';

import { 
    D3Service, D3, Selection, 
    PackLayout, HierarchyNode , 
    ScaleLinear, HSLColor, 
    Transition, Timer} from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 variable and the Selection interface
import * as d3r from 'd3-request';
import {DataService} from '../services/data.service'

@Component({
  selector: 'mapping',
  templateUrl: './mapping.component.html',
  styles:[require('./mapping.component.css').toString()],
  
})


export class MappingComponent implements AfterViewInit, OnInit{
    private d3: D3;
    private dataService:DataService;


    //private data:any;
    private FRONT_COLOR : HSLColor;
    private BACK_COLOR:HSLColor;

    constructor(d3Service:D3Service, dataService:DataService) { 
        this.d3 = d3Service.getD3(); 
        this.dataService = dataService;
        this.dataService.getData().subscribe(data => {
          this.display(this.d3, data);
      });
    }

    ngAfterViewInit() :void {
        //this.onRefreshGraph();
    }

    ngOnInit() : void{
        this.FRONT_COLOR = this.d3.hsl(152,0.8,0.8);
        this.BACK_COLOR = this.d3.hsl(228,0.4,0.4);
        this.onRefreshGraph();
    }

    getColorRange(start:HSLColor, end:HSLColor) {
        return this.d3.scaleLinear<HSLColor, HSLColor>()
        .domain([-1, 5])
        .range([start, end ])
        .interpolate(this.d3.interpolateHcl);
    }


    display(d3:D3, data:any){
        
        var svg = d3.select("svg"),
        margin = 20,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
    
        var color = this.getColorRange(this.FRONT_COLOR, this.BACK_COLOR);

        var pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(2);

        var root = data;

        root = d3.hierarchy(root)
            .sum(function(d:any) { return d.size; })
            .sort(function(a, b) { return b.value - a.value; });


        var focus = root,
            nodes = pack(root).descendants(),
            view:any;

        var circle = g.selectAll("circle")
        
            .data(nodes)
            .enter()
            .append("circle")
            
            .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
            .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });
        
        var text = g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .text(function(d:any) { return d.data.name; });
      

        var descriptionIcon = g.selectAll("icon")
            .data(nodes)
            .enter().append('text')
            .attr('font-family', 'FontAwesome')
            .attr("x","-15px")
            .attr('font-size', function(d:any) { return d.size + 'em'} )
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d:any) { return d.parent === root && d.data.description != undefined && d.data.description != "" ? "inline" : "none"; })
            .on("mouseover", function(d:any) {		
                    tooltip.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                        tooltip.html(d.data.description)	
                            .style("top", (d3.event.pageY + 15) + "px")
                            .style("left", (d3.event.pageX  - 5) + "px")
                    })					
                .on("mouseout", function(d) {		
                    tooltip.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                })
            .text(function(d:any) { return d.data.description === undefined ? "" : "\uf0c9" });


        //Define the div for the tooltip
        var tooltip = d3.select("body").append("div")	
            .attr("class", "tooltip")				
            .style("opacity", 0);


        var node = g.selectAll("circle,text,icon");

        svg
            .style("background", color(-1))
            .on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d:any) {
            var focus0 = focus; focus = d;

            var transition = d3.transition("move")
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function(d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function(t) { zoomTo(i(t)); };
                });

            transition.selectAll("text")
            .filter(function(d:any) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d:any) { return d.parent === focus ? 1 : 0; })
                .on("start", function(d:any) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d:any) { if (d.parent !== focus) this.style.display = "none"; });
        }

        function zoomTo(v:any) {
            var k = diameter / v[2]; view = v;
            node.attr("transform", function(d:any) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function(d) { return d.r * k; });
        }



    }
    

    onRefreshGraph(): void{

      
    
    }

}