import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../config/environment';
import { Auth } from '../../../../core/authentication/auth.service';

@Component({
    selector: 'pricing',
    templateUrl: './pricing.page.html',
    styleUrls: ['./pricing.page.css']
})
export class PricingComponent implements OnInit {

    public BILLING_SMALL_PLAN = environment.BILLING_SMALL_PLAN;
    public BILLING_MEDIUM_PLAN = environment.BILLING_MEDIUM_PLAN;
    public BILLING_PORTAL = environment.BILLING_PORTAL;

    constructor(public auth: Auth) { }

    ngOnInit(): void { }
}
