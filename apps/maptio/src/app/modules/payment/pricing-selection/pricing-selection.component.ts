import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '@maptio-environment';

@Component({
  selector: 'maptio-pricing-selection',
  templateUrl: './pricing-selection.component.html',
  styleUrls: ['./pricing-selection.component.scss'],
  standalone: true,
  imports: [NgForOf, FormsModule, NgbAccordionModule],
})
export class PricingSelectionComponent {
  BILLING_PLANS = environment.BILLING_PLANS;
  BILLING_BASE_URL = environment.BILLING_BASE_URL;

  contribution: Number = null;

  contributionOptions = this.BILLING_PLANS;

  submitted = false;

  onSubmit() {
    this.submitted = true;

    // Transform contribution value into a three digit string
    const billingPlanCode = this.contribution.toString().padStart(3, '0');

    const billingUrl = this.BILLING_BASE_URL + billingPlanCode;
    window.location.href = billingUrl;
  }
}
