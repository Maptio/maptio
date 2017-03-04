import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import {
  Component,
  OnInit,
  ViewChild
} from "@angular/core";
import { BuildingComponent } from "./components/building/building.component"
import { HelpComponent } from "./components/help/help.component";
import { DataSet } from "./shared/model/dataset.data"
import { DatasetFactory } from "./shared/services/dataset.factory"
import "rxjs/add/operator/map"
import { Auth } from "./shared/services/auth.service";
import { User } from "./shared/model/user.data"
@Component({
  selector: "my-app",
  template: require("./app.component.html"),
  providers: [Auth, DatasetFactory],
  styles: [require("./app.component.css").toString()]
})

export class AppComponent implements OnInit {

  @ViewChild("building")
  buildingComponent: BuildingComponent

  @ViewChild("help")
  helpComponent: HelpComponent;

  private empty: DataSet = DataSet.EMPTY;
  private datasets$: Promise<Array<DataSet>>;
  private selectedDataset: DataSet;

  public isBuildingPanelCollapsed: boolean = true;
  public loggedUser: User;

  constructor(private auth: Auth, private datasetFactory: DatasetFactory) {
  }

  start(dataset: DataSet) {
    this.selectedDataset = dataset;
    this.redraw()
  }

  ngOnInit() {
    this.auth.getUser().subscribe(
      (user: User) => {
        this.loggedUser = user;
        this.datasetFactory.get(this.loggedUser).then(o => {
          this.datasets$ = Promise.resolve(o);

          this.datasets$.then((datasets: DataSet[]) => {
            //console.log(datasets)
            datasets.forEach(function (d: DataSet, i: number, set: DataSet[]) {
              //console.log(i);
              this.datasetFactory.get(d.id).then((resolved: DataSet) => {
                set[i] = resolved;
              });
            }.bind(this));

          });
        });
      },
      (error: any) => { console.log(error) }
    );



  }

  openHelp() {
    this.helpComponent.open();
  }

  toggleBuildingPanel() {

    this.isBuildingPanelCollapsed = !this.isBuildingPanelCollapsed;
  }

  // this should be the job of the observable ? (TAKES TOO MUCH TIME)
  // http://stackoverflow.com/questions/38364591/how-to-combine-multiple-observables-together-in-angular-2
  private redraw() {
    this.buildingComponent.loadData(this.selectedDataset.id);
  }
}


