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
        
        d3.select("svg").selectAll("*").remove();
        var svg = d3.select("svg"),
        margin = 50,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        var color = this.getColorRange(this.FRONT_COLOR, this.BACK_COLOR);

        var pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(2);

        //console.log(JSON.stringify(data));
        var root = data;

        root = d3.hierarchy(root)
            .sum(function(d:any) { return d.size; })
            .sort(function(a, b) { return b.value - a.value; });


        var focus = root,
            nodes = pack(root).descendants(),
            view:any;

        var circle = g.selectAll("circle")
            .data(nodes)
            .remove()
            .enter()
            .append("circle")
            .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
            .on("click", function(d) { if (focus !== d) console.log(d.data), zoom(d), d3.event.stopPropagation(); })
            
            ;
        
        var definitions = svg.append("defs")
        var path = definitions.selectAll("path")
                    .data(nodes)
                    .enter()
                    .append("path")
                    .attr("id", function(d,i){return "s"+i;})
                    .text(function(d:any){return d.data.name});


        var text = g.selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("class", "label")
            .style("text-anchor","left")
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .append("textPath")
            .attr("xlink:href",function(d,i){return "#s"+i;})
            .attr("startOffset",function(d,i){return "10%";})
            .text(function(d:any) { return d.data.name; });


        var descriptionIcon = g.selectAll("icon")		
             .data(nodes)		
             .enter().append('text')		
             .attr('font-family', 'FontAwesome')		
             .attr("x","-15px")		
             .attr('font-size', function(d:any) { return d.size + 'em'} )		
             .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })		
             .style("display", function(d:any) { return d.parent === root && d.data.description != undefined && d.data.description != "" ? "inline" : "none"; })		
             	
                .append("textPath")
            .attr("xlink:href",function(d,i){return "#s"+i;})
            .attr("startOffset",function(d,i){return "10%";})
             .text(function(d:any) { return d.data.description === undefined ? "" : "\uf06e" });	
         

     

        var node = g.selectAll("path,circle,text");

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
                .style("fill-opacity", function(d:any) { /*return d.parent === focus ? 1 : 0;*/ return 1; })
                .on("start", function(d:any) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d:any) { if (d.parent !== focus) this.style.display = "none"; });
        }

        function zoomTo(v:any) {
            var watchedNode = "Engineering";
            //console.log(v);
            var k = diameter / v[2]; view = v;
            //console.log(k);

            //tooltip.attr("r", function(d) {  return d.r * k * 0.9 ; })
            node.attr("transform", function(d:any) { 
               
                return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"
                
            });
            circle.attr("r", function(d) { return d.r * k; });
            circle.text(function(d:any){return d.data.name + " " + (d.x - v[0]) * k + " " + (d.y - v[1]) * k ;})


            descriptionIcon
            .on("mouseover", function(d:any, i:any) {	

                    var group = g.append("g")
                                 .attr("id", "t" + i)
                                 .attr("transform",  "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")")


                    group.append("circle")
                        .style("class","tooltip")
                        .style("opacity",0.8)
                        .style("fill","white")
                        .attr("stroke","black")
                        
                        .attr("r", d.r * k)	
                        
                        group.append("text")
                        .text(d.data.description)
                    				
                     })							
                 .on("mouseout", function(d, i) {	

                     g.select("g#t"+i).remove();			
			
                 })	    
           
            path.attr("d", function(d, i){
                    var size = d.r * k + 2; // above the circle line
                    var centerX = 0 - size ; //d.x ;
                    var centerY = 0; //d.y ;
                    
                    var rx = -size;
                    var ry = -size;
                    return "m "+centerX+", "+centerY+" a "+rx+","+ry+" 1 1,1 "+size*2+",0 a -"+size+",-"+size+" 1 1,1 -"+size*2+",0" 
                    })


        }



    }
    

    onRefreshGraph(): void{

      
    
    }

}