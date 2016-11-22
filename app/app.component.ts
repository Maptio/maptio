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



export class AppComponent{

  @ViewChild('building')
  private buildingComponent: BuildingComponent

  constructor() {
  }

  start(datasetFileName: string) {
    this.buildingComponent.loadData(datasetFileName);
  }

  isProjectEmpty(): boolean {
    return this.buildingComponent.isEmpty();
  }

}


