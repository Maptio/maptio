import { Observable } from 'rxjs/Observable';
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { CanActivate, CanActivateChild, RouterStateSnapshot, Router } from "@angular/router";
import { BillingService } from '../billing/billing.service';
import { EmitterService } from '../emitter.service';
import { Team } from '../../model/team.data';
import { DatasetFactory } from '../dataset.factory';
import { DataSet } from '../../model/dataset.data';
import { TeamFactory } from '../team.factory';

@Injectable()
export class BillingGuard implements CanActivate, CanActivateChild {

    constructor(private billingService: BillingService, private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private router: Router) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.datasetFactory.get(<string>route.params["mapid"])
            .then(dataset => dataset.initiative.team_id)
            .then(teamId => {
                return this.teamFactory.get(teamId)
            })
            .then((team: Team) => {
                return this.billingService.getTeamStatus(team).toPromise().then((value: { created_at: Date, freeTrialLength: Number, isPaying: Boolean }) => {
                    team.createdAt = value.created_at;
                    team.freeTrialLength = value.freeTrialLength;
                    team.isPaying = value.isPaying;
                    console.log("billing uards",team.isPaying
                    ? true
                    : !team.isTeamLateOnPayment())
                    return team.isPaying
                        ? true
                        : !team.isTeamLateOnPayment()
                })

            })
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.canActivate(childRoute, state);
    }

}