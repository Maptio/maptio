import { Component } from '@angular/core';

import { LoginRedirectDirective } from '@maptio-login/login-redirect/login-redirect.directive';

@Component({
  selector: 'maptio-pricing-info',
  templateUrl: './pricing-info.component.html',
  styleUrls: ['./pricing-info.component.scss'],
  standalone: true,
  imports: [LoginRedirectDirective],
})
export class PricingInfoComponent {}
