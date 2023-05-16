import { Component } from '@angular/core';

import { environment } from '@maptio-environment';
import { UserService } from '@maptio-shared/services/user/user.service';

import { BillingSchedule } from './billing-schedule.enum';

@Component({
  selector: 'maptio-pricing',
  templateUrl: './pricing.page.html',
})
export class PricingComponent {
  BILLING_PLANS = environment.BILLING_PLANS;
  BillingSchedule = BillingSchedule;

  billingScheduleChoice = BillingSchedule.MONTHLY;

  constructor(public userService: UserService) {}
}
