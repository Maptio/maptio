import {
  Component,
  AfterViewInit,
  ViewChild,
  OnInit 
} from '@angular/core';

import { 
    D3Service, D3, Selection, 
    PackLayout, HierarchyNode , 
    Transition, Timer, BaseType, DragBehavior} from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 variable and the Selection interface
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
        
    }

    display(d3:D3, data:any){
        if(!data.children || data.children.length == 0 )
        {
            console.log("RETURN")
            d3.select("svg").selectAll("*").remove();
            return;
        }
        
        d3.select("svg").selectAll("*").remove();
        var svg = d3.select("svg"),
        margin = 50,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        var color = this.colorService.getColorRange(this.d3.hsl(0,0,0.93), this.d3.hsl(15,1,0.6));
   

        var pack = d3.pack()
            .size([diameter - margin, diameter - margin])
            .padding(2);

        var root = data;

        root = d3.hierarchy(root)
            .sum(function(d:any) { return d.size; })
            .sort(function(a, b) { return b.value- a.value });


        var focus = root,
            nodes = pack(root).descendants(),
            view:any;



        var circle = g.selectAll("circle")
            .data(nodes)
            .remove()
            .enter()
            .append("circle")
            .attr("class", function(d:any) { return d.parent ? (d.children ? "node" : "node node--leaf") : "node node--root"; })
            .style("fill", function(d:any) { return d.children ? color(d.depth) : null; })
            .on("click", function(d:any, i:number) { 
                if (focus !== d) 
                    zoom(d, i),  d3.event.stopPropagation();
                })
            ; 
        
        var definitions = svg.append("defs")
        var path = definitions.selectAll("path")
                    .data(nodes)
                    .enter()
                    .append("path")
                    .attr("id", function(d,i){return "s"+i;});

        var text = g.selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("id", function(d,i){return "t"+i;})
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .append("textPath")
            .attr("xlink:href",function(d,i){return "#s"+i;})
            .attr("startOffset",function(d,i){return "10%";})
            .text(function(d:any) { return d.data.name; })
            


        var descriptionIcon = g.selectAll("icon")		
            .data(nodes)		
            .enter().append('text')
            .attr("class","icon")			
            .attr("x","-10px")				
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })		
            .style("display", function(d:any) { return d.parent === root && d.data.description && d.data.description != "" ? "inline" : "none"; })		
            .append("textPath")
            .attr("xlink:href",function(d,i){return "#s"+i;})
            .attr("startOffset",function(d,i){return "10%";})
            .text(function(d:any) { return d.data.description === undefined ? "" : "\uf129" });	

        var description  = g.selectAll("description")
            .data(nodes)
            .enter()
            .append("g")
            .attr("id", function(d,i){return "description-group" + i})
            .style("display","none")
        var descriptionCircle = description
            .append("circle")
            .style("opacity",0.7)
            .style("fill", function(d){ return  d.children ? color(d.depth) : "white"})
            .attr("stroke","black")
        var descriptionContent = description
            .append("text")
            .style("class","tooltip")
            .attr("id", function(d,i){return "decription-content" + i})
            .attr("dy", 0)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("text-align","left")
            .attr("stroke", "black")
            .text(function(d:any){return d.data.description})

        var node = g.selectAll("path,circle,text, description");

        svg
            .style("background", color(-1))
            .on("click", function() { zoom(root, 0); });

        zoomTo([root.x, root.y, root.r * 2 + margin], -1);

        function zoom(d:any, index:number) {
            var focus0 = focus; focus = d;
    
            var transition = d3.transition("move")
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function(t) { zoomTo(i(t), index); };
                });

            transition.selectAll("text")
                .filter(function(d:any) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d:any) { return d.parent === focus ? 1 : 0;  })
                .on("start", function(d:any) { if (d.parent === focus) this.style.display = "inline"; })
                //.on("end", function(d:any) { if (d.parent !== focus) this.style.display = "none"; });
 
        }


       

        function wrap(text:Selection<BaseType, {}, HTMLElement,any>, actualText:string,  width:number) {
            
            text.each(function() {
                var text = d3.select(this),
                     words = actualText ? actualText.split(/\s+/).reverse() : [],
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
        
        
        function zoomTo(v:any, index:number) {
            var k = diameter / v[2]; view = v;
            node.attr("transform", function(d:any) { 
                return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"
            });

            circle.attr("r", function(d:any) { return d.r * k; });
            //circle.text(function(d:any){return d.data.name + " " + (d.x - v[0]) * k + " " + (d.y - v[1]) * k ;});
            circle
                .on("mouseover", function (d, i){
                    d3.selectAll("#t"+i).classed("highlighted", true); 
                })
                .on("mouseout", function(d, i){
                    d3.selectAll("#t"+i).classed("highlighted", false); 

                })


            text
                // .filter(function(d:any) {
                //     let maxAngle = 2/5 ;
                  
                //      d.tw = this.getComputedTextLength();
                //       var angle = d.tw /(2 * Math.PI * d.r *k);
                //     return angle < maxAngle;
                //     //return (Math.PI*(k*d.r)/2) < d.tw;
                // })
                .each(function(d:any) {

                    d.tw = d3.select(this).node().getComputedTextLength()
                    let maxAngle = k* 2 * Math.PI /3;
                  
                   
                    var proposedLabel = d.data.name;
                    var proposedLabelArray = proposedLabel.split('');
                    var angle = d.tw /d.r /k ;//d.tw /(2 * Math.PI * d.r);
                    console.log(d.data.name + "[" + d.tw + "]" + "ANGLE : " + angle + ", MAX" + maxAngle);

                    var i = 0;
                    while ((angle > maxAngle && proposedLabelArray.length)) {
                        i++;
                        // pull out 3 chars at a time to speed things up (one at a time is too slow)
                        proposedLabelArray.pop();proposedLabelArray.pop(); proposedLabelArray.pop();
                        if (proposedLabelArray.length===0) {
                            proposedLabel = "";
                        } else {
                            proposedLabel = proposedLabelArray.join('') + "..."; // manually truncate with ellipsis
                        }
                        d3.select(this).text(proposedLabel);
                        d.tw = d3.select(this).node().getComputedTextLength();
                        angle = d.tw /d.r/k  ; //d.tw /(2 * Math.PI * d.r);
                        console.log(i + ":"+d.data.name + "== " +proposedLabel+ + "[" + d.tw + "]" + "ANGLE : " + angle + ", MAX" + maxAngle);

                    }
                });


            description
                .style("display", function(d, i){return i === index && d.parent && !d.children ? "inline" : "none"})
           
            descriptionContent
                //.style("font-size", function(d){return k * 2* d.r * 15 /diameter})
                .attr("y", function(d){return  -d.r * k /2})
                .style("display", function(d, i){return i === index ? "inline" : "none"})
                .each(function(d:any, i:number){
                    if(i === index){
                        wrap(d3.select(this), d.data.description, diameter * 0.65);
                    }
                })
           
            descriptionCircle
                .attr("r", function(d){return  d.r * k})
           
            descriptionIcon
                .on("mouseover", function(d:any, i:any) {
                     descriptionContent
                        .style("display", function(d, i){return "inline"})
                        //.style("font-size", function(d:any){return k * 2* d.r * 15 /diameter})
                        .attr("y",  -d.r * k /2)
                        .call(wrap, d.data.description , d.r * 2 * k * 0.8)

                    d3.select("g#description-group"+i).style("display","inline");
                })							
                .on("mouseout", function(d, i) {	
                    d3.select("g#description-group"+i).style("display","none");
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


}