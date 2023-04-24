import { Component } from '@angular/core';

import { environment } from '@maptio-environment';
import { UserService } from '@maptio-shared/services/user/user.service';

import { BillingSchedule } from './billing-schedule.enum';
import { LoginRedirectDirective } from '../../../login/login-redirect/login-redirect.directive';
import { NgIf, AsyncPipe } from '@angular/common';
import { PaymentPlanComponent } from './payment-plan.component';

@Component({
  selector: 'maptio-pricing',
  templateUrl: './pricing.page.html',
  standalone: true,
  imports: [PaymentPlanComponent, NgIf, LoginRedirectDirective, AsyncPipe],
})
export class PricingComponent {
  BILLING_PLANS = environment.BILLING_PLANS;
  BillingSchedule = BillingSchedule;

  billingScheduleChoice = BillingSchedule.MONTHLY;

  constructor(public userService: UserService) {}
}
