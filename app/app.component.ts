import {
  Component,
  AfterViewInit,
  OnInit 
} from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styles:[require('./app.component.css').toString()]
})



export class AppComponent implements AfterViewInit  ,OnInit {

  constructor() { 
    }

   ngAfterViewInit() :void {
    }

    ngOnInit() {
    }

}


