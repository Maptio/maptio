import {
  Component,
  AfterViewInit,
  OnInit,
  ViewChild
} from '@angular/core';
import { BuildingComponent } from './building/building.component'
import { ImportComponent } from './import/import.component';
import { HelpComponent } from './help/help.component';
import { DataSet } from './model/dataset.data'
import {Views} from './model/view.enum'
import { DataSetService } from './services/dataset.service'
import 'rxjs/add/operator/map'

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styles: [require('./app.component.css').toString()]
})

export class AppComponent implements OnInit {

  @ViewChild('building')
  private buildingComponent: BuildingComponent

  @ViewChild('help')
  private helpComponent: HelpComponent;

  // @ViewChild('import')
  // private importComponent:ImportComponent;

  private empty: DataSet = DataSet.EMPTY;
  private datasets: DataSet[];
  private selectedDataset: DataSet;

  private selectedView: Views = Views.Circles; //per default

  constructor(public datasetService: DataSetService) {
  }

  start(dataset: DataSet) {
    this.selectedDataset = dataset;
    this.buildingComponent.loadData(dataset.url);
  }

  // openImport() {
  //   this.importComponent.open();
  // }

  isTreeviewSelected(): boolean {
    return this.selectedView == Views.Treeview;
  }
  isCircleViewSelected(): boolean {
    return this.selectedView == Views.Circles;
  }

  switchView() {
    switch (this.selectedView) {
      case Views.Circles:
        this.selectedView = Views.Treeview;
        break;
      case Views.Treeview:
        this.selectedView = Views.Circles;
        break
      default:
        throw new Error("This view is not recognized");
    }
  }

  isProjectEmpty(): boolean {
    return this.buildingComponent.isEmpty();
  }

  ngOnInit() {
    this.datasetService.getData().then(o => {
      this.datasets = o;
    });
  }

  openHelp() {
    this.helpComponent.open();
  }
}


