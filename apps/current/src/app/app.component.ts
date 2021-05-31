
import {of as observableOf, interval as observableInterval,  Subscription ,  Observable } from 'rxjs';

import {filter, mergeMap, timeInterval} from 'rxjs/operators';
import { Router} from "@angular/router";
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  isDevMode
} from "@angular/core";
import "rxjs/add/operator/map"
import { Auth } from "./core/authentication/auth.service";
import { environment } from "./config/environment";
import { Intercom } from 'ng-intercom';
import { NgProgress } from '@ngx-progressbar/core';
import { DeviceDetectorService } from 'ngx-device-detector';


@Component({
  selector: "maptio-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {

  public isHome: boolean;
  public isMap: boolean;

  public navigationStartSubscription: Subscription;
  public navigationOtherSubscription: Subscription;
  public checkTokenSubscription: Subscription;

  constructor(public auth: Auth, private router: Router, public progress: NgProgress,
    public intercom: Intercom, private deviceService: DeviceDetectorService, private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
    
    this.checkTokenSubscription = observableInterval(environment.CHECK_TOKEN_EXPIRATION_INTERVAL_IN_MINUTES * 60 * 1000).pipe(
      timeInterval(),
      mergeMap(() => { return observableOf(this.auth.allAuthenticated()) }),
      filter(isExpired => !isExpired),)
      .subscribe((isExpired: boolean) => {
        this.router.navigateByUrl("/logout")
      });

      this.intercom.boot({ app_id: environment.INTERCOM_APP_ID });


    window.onresize = (e: UIEvent) => {
      this.isMobile();
      this.cd.markForCheck();
    }
  }

  ngOnDestroy() {
    if (this.checkTokenSubscription) this.checkTokenSubscription.unsubscribe();
  }

  isMobile() {
    return this.deviceService.isMobile() || window.innerWidth < 500;
  }

}


