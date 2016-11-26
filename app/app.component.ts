import {
  Component,
  AfterViewInit,
  OnInit,
  ViewChild
} from '@angular/core';
import { BuildingComponent } from './building/building.component'
import { DataSet } from './model/dataset.data'
import { DataSetService } from './services/dataset.service'
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import 'rxjs/add/operator/map'

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styles: [require('./app.component.css').toString()]
})

export class AppComponent implements OnInit {

  @ViewChild('building')
  private buildingComponent: BuildingComponent


  @ViewChild('helpModal')
  modal: ModalComponent;

  private empty: DataSet = DataSet.EMPTY;
  private datasets: DataSet[];
  private selectedDataset: DataSet;


  constructor(public datasetService: DataSetService) {
  }

  start(dataset: DataSet) {
    this.selectedDataset = dataset;
    this.buildingComponent.loadData(dataset.url);
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
    this.modal.open();
  }
}


