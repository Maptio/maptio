import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild
} from "@angular/core";
import { HelpComponent } from "./components/help/help.component";
import { DataSet } from "./shared/model/dataset.data"
import { DatasetFactory } from "./shared/services/dataset.factory"
import "rxjs/add/operator/map"
import { Auth } from "./shared/services/auth.service";
@Component({
  selector: "my-app",
  template: require("./app.component.html"),
  providers: [Auth, DatasetFactory],
  styles: [require("./app.component.css").toString()]
})

export class AppComponent implements OnInit {

  @ViewChild("help")
  helpComponent: HelpComponent;

  private empty: DataSet = DataSet.EMPTY;


  constructor(private router: Router) {
  }

  openDataset(dataset: DataSet) {
    this.router.navigate(["work", dataset.id]);
  }

  ngOnInit() {

  }

  openHelp() {
    this.helpComponent.open();
  }
}


