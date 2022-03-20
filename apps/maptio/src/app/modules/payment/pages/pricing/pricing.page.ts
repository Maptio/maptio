import { Component } from '@angular/core';

import { environment } from '@maptio-config/environment';
import { UserService } from '@maptio-shared/services/user/user.service';


@Component({
  selector: 'maptio-pricing',
  templateUrl: './pricing.page.html'
})
export class PricingComponent {
  public BILLING_STARTER_PLAN = environment.BILLING_STARTER_PLAN;
  public BILLING_SMALL_PLAN = environment.BILLING_SMALL_PLAN;
  public BILLING_STANDARD_PLAN = environment.BILLING_STANDARD_PLAN;
  public BILLING_PORTAL = environment.BILLING_PORTAL;

  constructor(public userService: UserService) { }
}
