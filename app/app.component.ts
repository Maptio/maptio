import {
  Component,
  OnInit,
  ViewChild
} from "@angular/core";
import { BuildingComponent } from "./components/building/building.component"
import { HelpComponent } from "./components/help/help.component";
import { DataSet } from "./shared/model/dataset.data"
import { DataSetService } from "./shared/services/dataset.service"
import "rxjs/add/operator/map"
import { Auth } from "./shared/services/auth.service";
import { AuthenticatedUser } from './shared/model/user.model'
@Component({
  selector: "my-app",
  template: require("./app.component.html"),
  providers: [Auth],
  styles: [require("./app.component.css").toString()]
})

export class AppComponent implements OnInit {

  @ViewChild("building")
  buildingComponent: BuildingComponent

  @ViewChild("help")
  helpComponent: HelpComponent;

  private empty: DataSet = DataSet.EMPTY;
  private datasets: DataSet[];
  private selectedDataset: DataSet;

  public isBuildingPanelCollapsed: boolean = true;

  constructor(private auth: Auth, private datasetService: DataSetService) {
  }

  start(dataset: DataSet) {
    this.selectedDataset = dataset;
    this.redraw()
  }

  ngOnInit() {
    if (this.auth.getUser()) {// FIXME : make that promise
      let user = new AuthenticatedUser((<any>this.auth.getUser()).name || "", (<any>this.auth.getUser()).email);
      this.datasetService.getData(user).then(o => {
        this.datasets = o;
      });
    }
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
    this.buildingComponent.loadData(this.selectedDataset.url);
  }
}


