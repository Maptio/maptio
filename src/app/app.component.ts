import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild
} from "@angular/core";
import { HelpComponent } from "./components/help/help.component";
import { DataSet } from "./shared/model/dataset.data"
import "rxjs/add/operator/map"
@Component({
  selector: "my-app",
  template: require("./app.component.html"),
  styles: [require("./app.component.css").toString()]
})

export class AppComponent implements OnInit {

  @ViewChild("help")
  helpComponent: HelpComponent;

  constructor(private router: Router) {
  }

  openDataset(dataset: DataSet) {
    this.router.navigate(["workspace", dataset._id]);
  }

  createDataset(){
    this.router.navigate(["workspace/new"]);
  }

  ngOnInit() {

  }

  openHelp() {
    this.helpComponent.open();
  }
}


