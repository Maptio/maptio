import { LoaderService } from './../shared/services/http/loader.service';
import { EmitterService } from "../shared/services/emitter.service";
import { Router, NavigationStart, NavigationEnd, NavigationCancel } from "@angular/router";
import {
  Component,
  OnInit, AfterViewInit,
  ViewChild
} from "@angular/core";
import { HelpComponent } from "../components/help/help.component";
import { DataSet } from "../shared/model/dataset.data"
import "rxjs/add/operator/map"
@Component({
  selector: "my-app",
  template: require("./app.component.html"),
  styleUrls: ["./app.component.css"]
})

export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild("help")
  helpComponent: HelpComponent;

  constructor(private router: Router, private loaderService: LoaderService) {
  }

  openDataset(dataset: DataSet) {
    // EmitterService.get("datasetName").emit(dataset.initiative.name);
    this.router.navigate(["map", dataset._id]);
  }

  ngOnInit() {

  }

  openHelp() {
    this.helpComponent.open();
  }

  ngAfterViewInit() {
    this.router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.loaderService.show();
        }
        else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel
        ) {
          this.loaderService.hide();
        }
      });
  }
}


