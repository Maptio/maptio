import {
  Component,
  AfterViewInit,
  ViewChild,
  OnInit 
} from '@angular/core';

import { 
    D3Service, D3, Selection, 
    PackLayout, HierarchyNode , 
    Transition, Timer, BaseType} from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 variable and the Selection interface
import * as d3r from 'd3-request';
import {DataService} from '../services/data.service'
import {ColorService} from '../services/color.service'

@Component({
  selector: 'mapping',
  templateUrl: './mapping.component.html',
  styles:[require('./mapping.component.css').toString()],
  
})


export class MappingComponent implements AfterViewInit, OnInit{
    private d3: D3;
    private dataService:DataService;
    private colorService:ColorService;


    constructor(d3Service:D3Service, dataService:DataService, colorService:ColorService) { 
        this.d3 = d3Service.getD3(); 
        this.dataService = dataService;
        this.colorService = colorService;
        this.dataService.getData().subscribe(data => {

            this.display(this.d3, data);
      });
    }

    ngAfterViewInit() :void {
        //this.onRefreshGraph();
    }

    ngOnInit() : void{
        this.onRefreshGraph();
    }




    display(d3:D3, data:any){

        if(data.children.length == 0)
        {
            d3.select("svg").selectAll("*").remove();
            return;
        }
        
        d3.select("svg").selectAll("*").remove();
        var svg = d3.select("svg"),
        margin = 50,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        var color = this.colorService.getColorRange(this.d3.hsl(0,0,0.8), this.d3.hsl(15,1,0.6));
        console.log("COLORS");
        console.log(color);

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
        
        console.log(nodes);

        var circle = g.selectAll("circle")
            .data(nodes)
            .remove()
            .enter()
            .append("circle")
            .attr("class", function(d) { return d.parent ? (d.children ? "node" : "node node--leaf") : "node node--root"; })
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
            .on("click", function(d) { console.log(d); if (focus !== d) zoom(d), d3.event.stopPropagation(); })
            
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

        var description  = g.selectAll("description")
            .data(nodes)
            .enter()
            .append("g")
            .attr("id", function(d,i){return "d" + i})
            .style("display","none")
        var descriptionCircle = description
            .append("circle")
            .style("opacity",0.7)
            .style("fill", function(d){ return  d.children ? color(d.depth) : null})
            .attr("stroke","black")
        var descriptionContent = description
            .append("text")
            .style("class","tooltip")
            //.style("font-size", k * 2* d.r * 15 /diameter)
            //.attr("y", function(d){return -d.r * k /2)
            .attr("dy", 0)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("text-align","left")
            .text(function(d:any){return d.data.description})
            //.call(wrap, d.r * 2 * k * 0.8);

        var node = g.selectAll("path,circle,text, description");

        svg
            .style("background", color(-1))
            .on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d:any) {
            var focus0 = focus; focus = d;
            
            console.log("VIEW" + view) 
            console.log("FOCUS " + [focus.x, focus.y, focus.r * 2 + margin]);

            var transition = d3.transition("move")
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    console.log(i);
                    return function(t) { zoomTo(i(t)); };
                });

            transition.selectAll("text")
            .filter(function(d:any) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d:any) { return d.parent === focus ? 1 : 0;  })
                .on("start", function(d:any) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d:any) { if (d.parent !== focus) this.style.display = "none"; });
        }

        function wrap(text:Selection<BaseType, {}, HTMLElement,any>,  width:number) {
            console.log("WRAP " + width);
            text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word:any,
                    line:any[] = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    x = text.attr("x"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        var node: SVGTSpanElement = <SVGTSpanElement>tspan.node(); 
                        var hasGreaterWidth = node.getComputedTextLength() > width; 
                        if (hasGreaterWidth) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
                }
            });
            }

        
        
        // function addDescriptionGroup(d:any, v:any,  i:number, k:number){
        //     // var group = g.append("g")
        //     //                      .attr("id", "t" + i)
        //     //                      .attr("transform",  "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")")


        //             // group.append("circle")
        //             //     .style("opacity",0.7)
        //             //     .style("fill",  d.children ? color(d.depth) : null)
        //             //     .attr("stroke","black")
        //             //     .attr("r", d.r * k)	

        //             // group
        //             //     .append("text")
        //             //     .style("class","tooltip")
        //             //     .style("font-size", k * 2* d.r * 15 /diameter)
        //                 // .attr("y", -d.r * k /2)
        //                 // .attr("dy", 0)
        //                 // .attr("x", 0)
        //                 // .attr("text-anchor", "middle")
        //                 // .attr("text-align","left")
        //                 // .text(d.data.description)
        //                 // .call(wrap, d.r * 2 * k * 0.8);

        //                 // return g;
        // }
        
        
        
        
        
        function zoomTo(v:any) {
            var k = diameter / v[2]; view = v;
            //console.log(k);

            //tooltip.attr("r", function(d) {  return d.r * k * 0.9 ; })
            node.attr("transform", function(d:any) { 
               
                return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"
                
            });
            circle.attr("r", function(d) { return d.r * k; });
            circle.text(function(d:any){return d.data.name + " " + (d.x - v[0]) * k + " " + (d.y - v[1]) * k ;});

            descriptionCircle
                .attr("r", function(d){return  d.r * k})
            descriptionContent
                //.style("font-size", function(d){return k * 2* d.r * 15 /diameter})
                .attr("y",  function(d){return -d.r * k /2})
                .call(wrap,  function(d:any):number{return (d.r * 2 * k * 0.8)})

            descriptionIcon
                .on("mouseover", function(d:any, i:any) {
                    d3.select("g#d"+i).style("display","inline");
                })							
                .on("mouseout", function(d, i) {	
                    d3.select("g#d"+i).style("display","none");
                });	    

            path.attr("d", function(d, i){
                    var size = d.r * k + 3; // above the circle line
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