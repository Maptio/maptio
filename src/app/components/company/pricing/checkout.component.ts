import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import {Observable} from "rxjs/Observable"
import { Intercom } from '../../../../../node_modules/ng-intercom';
import { Auth } from '../../../core/authentication/auth.service';
import { environment } from '../../../config/environment';
import { DatasetFactory } from '../../../core/http/map/dataset.factory';
import { Team } from '../../../shared/model/team.data';
import { DataSet } from '../../../shared/model/dataset.data';
import { TeamFactory } from '../../../core/http/team/team.factory';

@Component({
    selector: 'pricing-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
    subscription: Subscription;
    planPrice: number;
    renewalDate: string;
    customerEmail: string;
    datasets: DataSet[];
    team:Team;
    SURVEY_URL:string = environment.SURVEY_URL;

    constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef,
        private intercom: Intercom, private auth: Auth, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory) { }

    ngOnInit(): void {
        this.subscription = this.route.queryParams
            .combineLatest(this.auth.getUser())
            .do(data => {
                let params = data[0];
                let user = data[1];

                let subscriptionId = params["sub_id"];
                let customerId = params["customer_id"];
                let planId = params["plan_id"];
                this.planPrice = params["plan_price"] / 100;
                this.customerEmail = params["customer_email"];
                this.renewalDate = params["renewal_date"];

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
                        chargebee_customer_id: customerId
                    }
                })

            })
            .flatMap(data => {
                return Observable.forkJoin(
                    this.datasetFactory.get(new Team({ team_id: data[1].teams[0] })),
                    this.teamFactory.get(<string>data[1].teams[0] )
                )
            })
            .map(([datasets, team]: [DataSet[], Team]) => {
                return [
                    datasets.map(d => {
                        let i = 0
                        d.initiative.traverse((n) => { i++ })
                        d.depth = i;
                        return d;
                    }),
                    team
                ];

            })
            .subscribe(([datasets, team]: [DataSet[], Team]) => {
                this.datasets = datasets;
                this.team = team;

                this.cd.markForCheck();

            })

    }

    private getPlanLimit(planId: string): number {
        switch (planId) {
            case "standard-plan":
                return 200
            case "standard-plan50":
                return 50
            case "standard-plan20":
                return 20
            default:
                return null
        }
    }
}
