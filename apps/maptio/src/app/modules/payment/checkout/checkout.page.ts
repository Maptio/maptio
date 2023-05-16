import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { tap, combineLatest, flatMap } from 'rxjs/operators';
import { Subscription, forkJoin } from 'rxjs';

import { Intercom } from 'ng-intercom';

import { environment } from '@maptio-environment';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { Team } from '@maptio-shared/model/team.data';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';

@Component({
  selector: 'pricing-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.css'],
})
export class CheckoutComponent implements OnInit {
  subscription: Subscription;
  planPrice: number;
  renewalDate: string;
  customerEmail: string;
  datasets: DataSet[];
  team: Team;

  FEATURE_REQUEST_EMAIL: string = environment.FEATURE_REQUEST_EMAIL;

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private intercom: Intercom,
    private userService: UserService,
    private datasetFactory: DatasetFactory,
    private teamFactory: TeamFactory
  ) {}

  ngOnInit(): void {
    this.subscription = this.route.queryParams
      .pipe(
        combineLatest(this.userService.user$),

        tap((data) => {
          const params = data[0];
          const user = data[1];

          const subscriptionId = params['sub_id'];
          const customerId = params['customer_id'];
          const planId = params['plan_id'];
          this.planPrice = params['plan_price'] / 100;
          this.customerEmail = params['customer_email'];
          this.renewalDate = params['renewal_date'];

          this.cd.markForCheck();

          this.intercom.update({
            app_id: environment.INTERCOM_APP_ID,
            email: user.email,
            user_id: user.user_id,
            company: {
              company_id: user.teams[0],
              is_paying: true,
              plan: planId,
              monthly_spend: this.planPrice,
              plan_limit: this.getPlanLimit(planId),
              chargebee_subscription_id: subscriptionId,
              chargebee_customer_id: customerId,
            },
          });
        })
      )
      .pipe(
        flatMap((data: [Params, User]) => {
          return forkJoin(
            this.datasetFactory.get(new Team({ team_id: data[1].teams[0] })),
            this.teamFactory.get(<string>data[1].teams[0])
          );
        })
      )
      .subscribe(([datasets, team]: [DataSet[], Team]) => {
        this.datasets = datasets;
        this.team = team;

        this.cd.markForCheck();
      });
  }

  private getPlanLimit(planId: string): number {
    switch (planId) {
      case 'standard-plan':
        return 200;
      case 'standard-plan50':
        return 50;
      case 'standard-plan20':
        return 20;
      default:
        return null;
    }
  }
}
