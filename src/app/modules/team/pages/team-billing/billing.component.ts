import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BillingService } from '../../../../shared/services/billing/billing.service';
import { ActivatedRoute } from '@angular/router';
import { Team } from '../../../../shared/model/team.data';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Permissions } from '../../../../shared/model/permission.data';
import { environment } from '../../../../config/environment';
import { LoaderService } from '../../../../shared/components/loading/loader.service';

@Component({
    selector: 'team-billing',
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.css']
})
export class TeamBillingComponent implements OnInit {
    public team: Team;
    public remaningTrialDays: Number;
    public isLoading: boolean;
    public Permissions = Permissions;
    public KB_URL_INTEGRATIONS = environment.KB_URL_INTEGRATIONS;
    public BILLING_SMALL_PLAN = environment.BILLING_SMALL_PLAN;
    public BILLING_MEDIUM_PLAN = environment.BILLING_MEDIUM_PLAN;
    public BILLING_PORTAL = environment.BILLING_PORTAL;
    public BILLING_TEST_PLAN = environment.BILLING_TEST_PLAN;

    constructor(private route: ActivatedRoute, private billingService: BillingService,
        private cd: ChangeDetectorRef, private loaderService: LoaderService) { }

    ngOnInit(): void {
        this.loaderService.show();
        this.route.parent.data
            .flatMap((data: { assets: { team: Team, datasets: DataSet[] } }) => {
                return this.billingService.getTeamStatus(data.assets.team).map((value: { created_at: Date, freeTrialLength: Number, isPaying: Boolean, plan: string, maxMembers: number, price:number }) => {
                    data.assets.team.createdAt = value.created_at;
                    data.assets.team.freeTrialLength = value.freeTrialLength;
                    data.assets.team.isPaying = value.isPaying;
                    data.assets.team.planName = value.plan;
                    data.assets.team.planLimit = value.maxMembers;
                    data.assets.team.planMonthlyPrice = value.price;

                    return data.assets.team;
                })
            })
            .subscribe((team: Team) => {
                this.team = team;
                this.remaningTrialDays = team.getRemainingTrialDays();
                this.cd.markForCheck();
                this.loaderService.hide();
            });

    }
}
