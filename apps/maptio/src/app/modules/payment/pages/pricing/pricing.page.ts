import { Component } from '@angular/core';

import { environment } from '@maptio-config/environment';
import { Auth } from '@maptio-core/authentication/auth.service';


@Component({
  selector: 'maptio-pricing',
  templateUrl: './pricing.page.html'
})
export class PricingComponent {
  public BILLING_TINY_PLAN = environment.BILLING_TINY_PLAN;
  public BILLING_SMALL_PLAN = environment.BILLING_SMALL_PLAN;
  public BILLING_MEDIUM_PLAN = environment.BILLING_MEDIUM_PLAN;
  public BILLING_LARGE_PLAN = environment.BILLING_LARGE_PLAN;
  public BILLING_PORTAL = environment.BILLING_PORTAL;

  constructor(public auth: Auth) { }
}
