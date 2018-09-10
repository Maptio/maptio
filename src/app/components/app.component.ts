import { Subscription } from "rxjs/Subscription";
import { LoaderService } from "./../shared/services/loading/loader.service";
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from "@angular/router";
import {
  Component,
  ViewChild,
  ChangeDetectionStrategy
} from "@angular/core";
import { HelpComponent } from "../components/help/help.component";
import "rxjs/add/operator/map"
import { Auth } from "../shared/services/auth/auth.service";
import { environment } from "../../environment/environment";
import { Observable } from "rxjs/Observable";
import { Intercom } from 'ng-intercom';
import { NgProgress } from "ngx-progressbar";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {

  public isHome: boolean;
  public isMap: boolean;

  public routerSubscription: Subscription;

  @ViewChild("help")
  helpComponent: HelpComponent;

  constructor(public auth: Auth, private router: Router, private ngProgress: NgProgress,
    public intercom: Intercom) {

    this.routerSubscription = this.router.events
      .subscribe((event) => {
        // console.log(event)
        if (event instanceof NavigationStart) {
          // this.isHome = this.isUrlHome(event.url)
          // this.isMap = this.isUrlMap(event.url);
          // (<any>window).Intercom("update");
          this.ngProgress.start();
        }
        else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel
        ) {
          this.isHome = this.isUrlHome(event.url)
          this.ngProgress.done();
        }

        if (event instanceof NavigationError) {
          this.ngProgress.done();
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

  ngOnInit() {
    Observable
      .interval(environment.CHECK_TOKEN_EXPIRATION_INTERVAL_IN_MINUTES * 60 * 1000)
      .timeInterval()
      .flatMap(() => { return Observable.of(this.auth.allAuthenticated()) })
      .filter(isExpired => !isExpired)
      .subscribe((isExpired: boolean) => {
        this.router.navigateByUrl("/logout")
      });

    this.intercom.boot({ app_id: environment.INTERCOM_APP_ID });
  }

  // ngAfterViewInit() {

  // }

  // ngAfterViewChecked() {
  //   (<any>window).Intercom("boot", {
  //     app_id: "rktylk1k"
  //   });
  // }

}


