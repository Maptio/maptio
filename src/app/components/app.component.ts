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

  @ViewChild("help")
  helpComponent: HelpComponent;

  constructor(private auth: Auth, private route: ActivatedRoute, private router: Router, private loaderService: LoaderService) {
    // this.route.snapshot.url
    //   console.log(this.router.url, this.router.url === "/home" ||  this.router.url === "/");
    //   console.log(segments)
    //   this.isHome = this.router.url === "/home" ||  this.router.url === "/"

    // })
  
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
        this.isHome = this.router.url.startsWith("/home") ||  this.router.url === "/"
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


