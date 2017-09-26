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

export class AppComponent implements AfterViewInit {

  private isHome: boolean;
  private isMap: boolean;

  public routerSubscription: Subscription;

  @ViewChild("help")
  helpComponent: HelpComponent;

  constructor(private router: Router, private loaderService: LoaderService) {
    this.routerSubscription = this.router.events
    .subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isHome = this.isUrlHome(event.url)
        this.isMap = this.isUrlMap(event.url)
        this.loaderService.show();
      }
      else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel
      ) {
        this.isHome = this.isUrlHome(event.url)
        this.loaderService.hide();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) this.routerSubscription.unsubscribe()
  }

  isUrlHome(url: string): boolean {
    return url.startsWith("/home") || url === "/";
  }

  isUrlMap(url: string): boolean {
    return url.startsWith("/map")
  }

}


