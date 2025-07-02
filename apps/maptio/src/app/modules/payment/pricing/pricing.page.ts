import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { environment } from '@maptio-environment';
import { UserService } from '@maptio-shared/services/user/user.service';

import { LoginRedirectDirective } from '@maptio-login/login-redirect/login-redirect.directive';
import { PricingInfoComponent } from '../pricing-info/pricing-info.component';
import { PricingSelectionComponent } from '../pricing-selection/pricing-selection.component';

@Component({
    selector: 'maptio-pricing',
    templateUrl: './pricing.page.html',
    imports: [
    AsyncPipe,
    LoginRedirectDirective,
    PricingInfoComponent,
    PricingSelectionComponent
]
})
export class PricingComponent {
  BILLING_PLANS = environment.BILLING_PLANS;

  constructor(public userService: UserService) {}
}
