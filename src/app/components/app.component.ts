import { Subscription } from 'rxjs/Subscription';
import { Observable, Subject } from "rxjs/Rx";
import { LoaderService } from "./../shared/services/http/loader.service";
import { EmitterService } from "../shared/services/emitter.service";
import { Router, NavigationStart, NavigationEnd, NavigationCancel, ActivatedRouteSnapshot, ActivatedRoute, UrlSegment } from "@angular/router";
import {
  Component,
  OnInit, AfterViewInit,
  ViewChild
} from "@angular/core";
import { HelpComponent } from "../components/help/help.component";
import { DataSet } from "../shared/model/dataset.data"
import "rxjs/add/operator/map"
import { Auth } from "../shared/services/auth/auth.service";
@Component({
  selector: "my-app",
  template: require("./app.component.html"),
  styleUrls: ["./app.component.css"]
})

export class AppComponent implements OnInit, AfterViewInit {

  private isHome: boolean;
  private isMap: boolean;

  private routerSubscription: Subscription;

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

  ngOnDestroy() {
    if (this.routerSubscription) this.routerSubscription.unsubscribe()
  }

  ngAfterViewInit() {
    this.routerSubscription = this.router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {

          this.isHome = event.url.startsWith("/home") || event.url === "/";
          this.isMap = event.url.startsWith("/map")
          this.loaderService.show();
        }
        else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel
        ) {
          this.isHome = event.url.startsWith("/home") || event.url === "/"
          this.loaderService.hide();
        }
      });
  }
}


