import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { SubSink } from 'subsink';
import { Intercom } from 'ng-intercom';
import { DeviceDetectorService } from 'ngx-device-detector';

import { environment } from '@maptio-environment';
import { LoaderService } from './shared/components/loading/loader.service';

@Component({
  selector: 'maptio-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  public isHome: boolean;
  public isMap: boolean;

  public navigationStartSubscription: Subscription;
  public navigationOtherSubscription: Subscription;

  public showUi;
  public isWorkspace;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    public intercom: Intercom,
    private deviceService: DeviceDetectorService,
    private cd: ChangeDetectorRef,
    public loader: LoaderService
  ) {}

  ngOnInit() {
    this.loader.init();

    this.intercom.boot({ app_id: environment.INTERCOM_APP_ID });

    window.onresize = (e: UIEvent) => {
      this.isMobile();
      this.cd.markForCheck();
    };

    this.subs.sink = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const routeData = this.activatedRoute.firstChild.snapshot.data;
        this.isWorkspace = !!routeData['isWorkspace'];
        this.showUi = !routeData['hideUI'];
        this.showIntercomWidget(this.showUi);
        this.cd.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  isMobile() {
    return this.deviceService.isMobile() || window.innerWidth < 500;
  }

  showIntercomWidget(showWidget: boolean) {
    if (showWidget) {
      this.renderer.removeClass(document.body, 'hide-intercom-widget');
    } else {
      this.renderer.addClass(document.body, 'hide-intercom-widget');
    }
  }
}
