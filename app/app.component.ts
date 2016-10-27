import {
  Component,
  OnChanges,
  AfterViewInit,
  Input,
  ElementRef,
  ViewChild,
  OnInit 
} from '@angular/core';

import { FormsModule }   from '@angular/forms';


import { 
    D3Service, D3, Selection, 
    PackLayout, HierarchyNode , 
    ScaleLinear, HSLColor, 
    Transition, Timer} from 'd3-ng2-service'; // <-- import the D3 Service, the type alias for the d3 variable and the Selection interface
import * as d3r from 'd3-request';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styles:[require('./app.component.css').toString()]
})



export class AppComponent implements AfterViewInit  ,OnInit {

  private d3: D3;
  private htmlElement:HTMLElement;
  private host: any;
  @ViewChild('container') element: ElementRef;

  constructor(element: ElementRef, d3Service: D3Service) { // <-- pass the D3 Service into the constructor
        this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.htmlElement = element.nativeElement;
    }

   ngAfterViewInit() :void {
        console.log("ngAfterViewInit")
        this.htmlElement = this.element.nativeElement;
        this.host        = this.d3.select(this.htmlElement);
    }

    ngOnInit() {
        let d3 = this.d3; 
    }

}


