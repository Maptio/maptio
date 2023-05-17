import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SanitizerModule } from '@maptio-shared/sanitizer.module';
import { LoginModule } from '@maptio-login/login.module';

import { CheckoutComponent } from './checkout/checkout.page';
import { PricingComponent } from './pricing/pricing.page';
import { PricingInfoComponent } from './pricing-info/pricing-info.component';
import { PaymentPlanComponent } from './pricing/payment-plan.component';
import { PaymentRoutingModule } from './payment.routing';

@NgModule({
  declarations: [
    CheckoutComponent,
    PricingComponent,
    PricingInfoComponent,
    PaymentPlanComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    SanitizerModule,
    PaymentRoutingModule,
    LoginModule,
  ],
  providers: [],
})
export class PaymentModule {}
