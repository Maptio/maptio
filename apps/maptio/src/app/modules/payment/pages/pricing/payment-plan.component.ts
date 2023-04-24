import { Component, HostBinding, Input, OnChanges } from '@angular/core';

import { UserService } from '@maptio-shared/services/user/user.service';

import { BillingSchedule } from './billing-schedule.enum';
import { LoginRedirectDirective } from '../../../login/login-redirect/login-redirect.directive';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'maptio-payment-plan',
    templateUrl: './payment-plan.component.html',
    standalone: true,
    imports: [NgIf, LoginRedirectDirective, AsyncPipe]
})
export class PaymentPlanComponent implements OnChanges {
  @HostBinding('class') classes =
    'col-12 col-md-4 accent-blue rounded-bottom box-shadow mx-2 my-3';

  @Input() name: string;
  @Input() text: number;
  @Input() billingSchedule: BillingSchedule;
  @Input() prices: { [key in BillingSchedule]: number };
  @Input() billingLinks: { [key in BillingSchedule]: string };

  price: number;
  billingLink: string;

  constructor(public userService: UserService) {}

  ngOnChanges() {
    if (this.prices && this.billingLinks && this.billingSchedule) {
      this.price = this.prices[this.billingSchedule];
      this.billingLink = this.billingLinks[this.billingSchedule];
    }
  }
}
