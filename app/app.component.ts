import {
  Component,
  OnChanges,
  AfterViewInit,
  Input,
  ElementRef,
  ViewChild,
  OnInit 
} from '@angular/core';

import { 
    D3Service, D3, Selection, 
    PackLayout, HierarchyNode , 
    ScaleLinear, HSLColor, 
    Transition, Timer} from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 variable and the Selection interface
import * as d3r from 'd3-request';

export class NodeData{
    name:string; 
    size:number;
    children:Array<NodeData>;
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styles:[require('./app.component.css').toString()]
})



export class AppComponent implements AfterViewInit  ,OnInit {

    private d3: D3;
    private htmlElement:HTMLElement;
    private host: any;
    
    constructor(element: ElementRef, d3Service: D3Service) { // <-- pass the D3 Service into the constructor
        this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.htmlElement = element.nativeElement;
    }

    ngOnInit() {
        let d3 = this.d3; 
    }

    @ViewChild('container') element: ElementRef;
    
    ngAfterViewInit() :void {
        console.log("ngAfterViewInit")
        this.htmlElement = this.element.nativeElement;
        this.host        = this.d3.select(this.htmlElement);
        this.onRefreshGraph();
    }

    onRefreshGraph(): void{
let d3 = this.d3; 

        console.log("REFRESH");
        var svg = d3.select("svg"),
        margin = 20,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
    
    var color = d3.scaleLinear<HSLColor, HSLColor>()
    .domain([-1, 5])
    .range([d3.hsl(152,0.8,0.8), d3.hsl(228,0.3,0.4)])
    .interpolate(d3.interpolateHcl);

    var pack = d3.pack<NodeData>()
        .size([diameter - margin, diameter - margin])
        .padding(2);
    
    d3r.json("public/flare.json", function(error:Error, root:any) {
        console.log("REQUEST");
        console.log(root);
        
         if(error)
        {
            return console.error(error);
        }
  

  root = d3.hierarchy(root)
      .sum(function(d:NodeData) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  var focus = root,
      nodes = pack(root).descendants(),
      view:any;

  var circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

  var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .text(function(d) { return d.data.name; });

  var node = g.selectAll("circle,text");

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
    
    });
    }

    setup() : void{
        console.log("SETUP");
    }

}


