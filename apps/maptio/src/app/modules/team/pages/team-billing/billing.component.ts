import { map, mergeMap } from 'rxjs/operators';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BillingService } from '../../../../shared/services/billing/billing.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Team } from '../../../../shared/model/team.data';
import { DataSet } from '../../../../shared/model/dataset.data';
import { Permissions } from '../../../../shared/model/permission.data';
import { environment } from '../../../../config/environment';
import { LoaderService } from '../../../../shared/components/loading/loader.service';
import { PermissionsDirective } from '../../../../shared/directives/permission.directive';
import { JsonPipe, NgIf } from '@angular/common';
import { PricingSelectionComponent } from 'app/modules/payment/pricing-selection/pricing-selection.component';

@Component({
    selector: 'team-billing',
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.css'],
    imports: [
        NgIf,
        JsonPipe,
        PermissionsDirective,
        RouterLink,
        PricingSelectionComponent,
    ]
})
export class TeamBillingComponent implements OnInit {
  public team: Team;
  public remaningTrialDays: number;
  public remaningTrialDaysMessage: string;
  public isLoading: boolean;
  public Permissions = Permissions;
  public BILLING_PORTAL = environment.BILLING_PORTAL;

  constructor(
    private route: ActivatedRoute,
    private billingService: BillingService,
    private cd: ChangeDetectorRef,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.show();
    this.route.parent.data
      .pipe(
        mergeMap((data: { assets: { team: Team; datasets: DataSet[] } }) => {
          return this.billingService.getTeamStatus(data.assets.team).pipe(
            map(
              (value: {
                created_at: Date;
                freeTrialLength: number;
                isPaying: boolean;
                plan: string;
                maxMembers: number;
                price: number;
              }) => {
                data.assets.team.createdAt = value.created_at;
                data.assets.team.freeTrialLength = value.freeTrialLength;
                data.assets.team.isPaying = value.isPaying;
                data.assets.team.planName = value.plan;
                data.assets.team.planLimit = value.maxMembers;
                data.assets.team.planMonthlyPrice = value.price;

                return data.assets.team;
              }
            )
          );
        })
      )
      .subscribe((team: Team) => {
        this.team = team;
        this.remaningTrialDays = team.getRemainingTrialDays();
        this.remaningTrialDaysMessage = team.getFreeTrialTimeLeftMessage();
        this.cd.markForCheck();
        this.loaderService.hide();
      });
  }
}
