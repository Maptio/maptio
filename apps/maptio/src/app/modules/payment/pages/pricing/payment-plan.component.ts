import { Component, HostBinding, Input } from '@angular/core';

import { Auth } from '@maptio-core/authentication/auth.service';


@Component({
  selector: 'maptio-payment-plan',
  templateUrl: './payment-plan.component.html',
})
export class PaymentPlanComponent {
  @HostBinding('class') classes = 'col-12 col-md-4 accent-blue rounded-bottom box-shadow mx-2 my-3';

  @Input() name: string;
  @Input() price: number;
  @Input() text: number;
  @Input() billingLink: string;

  constructor(public auth: Auth) { }
}