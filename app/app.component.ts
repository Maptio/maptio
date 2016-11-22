import {
  Component,
  AfterViewInit,
  OnInit 
} from '@angular/core';
//import {InitiativeNode} from './building/initiative.data'


@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styles:[require('./app.component.css').toString()],
  //providers:[InitiativeNode]
})



export class AppComponent implements AfterViewInit  ,OnInit {

  constructor() { 
    }

   ngAfterViewInit() :void {
    }

    ngOnInit() {
    }

}


