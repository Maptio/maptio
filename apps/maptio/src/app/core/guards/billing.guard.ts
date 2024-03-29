import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterStateSnapshot, Router } from '@angular/router';
import { BillingService } from '../../shared/services/billing/billing.service';
import { EmitterService } from '../services/emitter.service';
import { Team } from '../../shared/model/team.data';
import { DatasetFactory } from '../http/map/dataset.factory';
import { DataSet } from '../../shared/model/dataset.data';
import { TeamFactory } from '../http/team/team.factory';

@Injectable()
export class BillingGuard  {
  constructor(
    private billingService: BillingService,
    private datasetFactory: DatasetFactory,
    private teamFactory: TeamFactory,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return this.datasetFactory
      .get(<string>route.params['mapid'])
      .then((dataset) => dataset.initiative.team_id)
      .then((teamId) => {
        return this.teamFactory.get(teamId);
      })
      .then((team: Team) => {
        if (team.isExample) {
          return Promise.resolve({
            team: team,
            isAllowed: true,
          });
        } else {
          return this.billingService
            .getTeamStatus(team)
            .toPromise()
            .then(
              (value: {
                created_at: Date;
                freeTrialLength: number;
                isPaying: boolean;
              }) => {
                team.createdAt = value.created_at;
                team.freeTrialLength = value.freeTrialLength;
                team.isPaying = value.isPaying;
                return {
                  team: team,
                  isAllowed: team.isPaying ? true : !team.isTeamLateOnPayment(),
                };
              }
            );
        }
      })
      .then((r: { team: Team; isAllowed: boolean }) => {
        if (!r.isAllowed) {
          this.router.navigateByUrl(`/teams/${r.team.team_id}/maptio/billing`);
        }
        return true;
      });
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return this.canActivate(childRoute, state);
  }
}
