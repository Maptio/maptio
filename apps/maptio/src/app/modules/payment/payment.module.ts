import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SanitizerModule } from '@maptio-shared/sanitizer.module';
import { LoginModule } from '@maptio-login/login.module';

import { CheckoutComponent } from './pages/checkout/checkout.page';
import { PricingComponent } from './pages/pricing/pricing.page';
import { PaymentPlanComponent } from './pages/pricing/payment-plan.component';
import { PaymentRoutingModule } from './payment.routing';


@NgModule({
  declarations: [
    CheckoutComponent,
    PricingComponent,
    PaymentPlanComponent
  ],
  imports: [
    CommonModule,
    SanitizerModule,
    PaymentRoutingModule,
    LoginModule,
  ],
  providers: [],
})
export class PaymentModule {}
