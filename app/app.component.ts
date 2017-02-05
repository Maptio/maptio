import {
  Component,
  AfterViewInit,
  OnInit,
  ViewChild
} from '@angular/core';
import { BuildingComponent } from './components/building/building.component'
import { HelpComponent } from './components/help/help.component';
import { DataSet } from './model/dataset.data'
import { Views } from './model/view.enum'
import { DataSetService } from './services/dataset.service'
import 'rxjs/add/operator/map'
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'my-app',
  template: require('./app.component.html'),
  styles: [require('./app.component.css').toString()]
})

export class AppComponent implements OnInit {

  @ViewChild('building')
  buildingComponent: BuildingComponent

  @ViewChild('help')
  helpComponent: HelpComponent;

  private empty: DataSet = DataSet.EMPTY;
  private datasets: DataSet[];
  private selectedDataset: DataSet;

  public isBuildingPanelCollapsed: boolean = true;

  constructor(public datasetService: DataSetService) {
  }

  start(dataset: DataSet) {
    this.selectedDataset = dataset;
    this.redraw()
  }

  ngOnInit() {
    this.datasetService.getData().then(o => {
      this.datasets = o;
    });

  }

  openHelp() {
    this.helpComponent.open();
  }

  toggleBuildingPanel() {

    this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
  }

  //this should be the job of the observable ? (TAKES TOO MUCH TIME)
  //http://stackoverflow.com/questions/38364591/how-to-combine-multiple-observables-together-in-angular-2
  private redraw() {
    this.buildingComponent.loadData(this.selectedDataset.url);
  }
}


