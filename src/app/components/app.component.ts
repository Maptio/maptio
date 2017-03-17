import { EmitterService } from "../shared/services/emitter.service";
import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild
} from "@angular/core";
import { HelpComponent } from "../components/help/help.component";
import { DataSet } from "../shared/model/dataset.data"
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
    EmitterService.get("datasetName").emit(dataset.name);
    this.router.navigate(["workspace", dataset._id]);
  }

  ngOnInit() {

  }

  openHelp() {
    this.helpComponent.open();
  }
}


