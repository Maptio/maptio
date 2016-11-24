import {
  Component,
  AfterViewInit,
  OnInit,
  ViewChild
} from '@angular/core';
import { BuildingComponent } from './building/building.component'


@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styles: [require('./app.component.css').toString()]
})



export class AppComponent implements OnInit {

  @ViewChild('building')
  private buildingComponent: BuildingComponent

  private dataset:string;

  constructor() {
  }

  start(datasetFileName: string) {
    this.dataset = datasetFileName === "new.json"  ? "" : datasetFileName.replace(".json","").toUpperCase();;
    this.buildingComponent.loadData(datasetFileName);
  }

  isProjectEmpty(): boolean {
    return this.buildingComponent.isEmpty();
  }

  ngOnInit(){
    this.start("new.json");
  }

}


