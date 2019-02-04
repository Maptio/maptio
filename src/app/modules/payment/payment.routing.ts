import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckoutComponent } from './pages/checkout/checkout.page';
import { PricingComponent } from './pages/pricing/pricing.page';


const routes: Routes = [
    {
        path: "",
        children: [

            { path: "pricing", component: PricingComponent },

            { path: "checkout", component: CheckoutComponent },
         
        ]

    }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }