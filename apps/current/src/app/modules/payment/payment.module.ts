import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SanitizerModule } from "../../shared/sanitizer.module";
import { CheckoutComponent } from "./pages/checkout/checkout.page";
import { PricingComponent } from "./pages/pricing/pricing.page";
import { PaymentRoutingModule } from "./payment.routing";


@NgModule({
    declarations: [
        CheckoutComponent,
        PricingComponent
    ],
    imports: [CommonModule,
        SanitizerModule,
        PaymentRoutingModule],
    providers: [],
})
export class PaymentModule { }