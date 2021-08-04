import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";

import {of as observableOf, interval as observableInterval,  Subscription, Observable } from 'rxjs';
import { map, switchMap, filter, mergeMap, timeInterval, tap } from 'rxjs/operators';

import { SubSink } from "subsink";
import { Intercom } from 'ng-intercom';
import { DeviceDetectorService } from 'ngx-device-detector';

import { Auth } from "./core/authentication/auth.service";
import { environment } from "./config/environment";
import { LoaderService } from "./shared/components/loading/loader.service";


@Component({
  selector: "maptio-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  public isHome: boolean;
  public isMap: boolean;

  public showUi$: Observable<boolean>;

  public navigationStartSubscription: Subscription;
  public navigationOtherSubscription: Subscription;

  constructor(
    public auth: Auth,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public intercom: Intercom,
    private deviceService: DeviceDetectorService,
    private cd: ChangeDetectorRef,
    public loader: LoaderService,
  ) {

  }

  ngOnInit() {
    this.loader.init();

    this.showUi$ = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => route.firstChild),
        switchMap(route => route.data),
        map(data => !data['hideUI']),
        tap(showUi => this.showIntercomWidget(showUi) )
      )

    this.subs.sink = observableInterval(environment.CHECK_TOKEN_EXPIRATION_INTERVAL_IN_MINUTES * 60 * 1000)
      .pipe(
        timeInterval(),
        mergeMap(() => { return observableOf(this.auth.allAuthenticated()) }),
        filter(isExpired => !isExpired),
      )
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
    this.subs.unsubscribe();
  }

  isMobile() {
    return this.deviceService.isMobile() || window.innerWidth < 500;
  }

  showIntercomWidget(showWidget: boolean) {
    this.intercom.update({
      'hide_default_launcher': !showWidget
    });
  }
}
