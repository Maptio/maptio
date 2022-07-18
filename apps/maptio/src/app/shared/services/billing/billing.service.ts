import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IntercomCompany } from '../../interfaces/intercom-company.interface';
import { TeamStatus } from '../../interfaces/team-status.interface';
import { Team } from '../../model/team.data';

@Injectable()
export class BillingService {
  constructor(private http: HttpClient) {}

  getTeamStatus(team: Team): Observable<TeamStatus> {
    return this.http.get(`/api/v1/intercom/team/${team.team_id}`).pipe(
      map((response: any) => {
        return response.statusCode == 200 ? response.body : null;
      }),
      map((result: IntercomCompany | null) => {
        return result
          ? {
              created_at: new Date(result.created_at * 1000),
              freeTrialLength: result.custom_attributes.free_trial_length,
              isPaying: result.custom_attributes.is_paying,
              plan: result.plan.name,
              maxMembers: result.custom_attributes.plan_limit,
              price: result.monthly_spend,
            }
          : {
              created_at: new Date(),
              freeTrialLength: -1,
              isPaying: true,
              plan: '',
              maxMembers: null,
              price: null,
            };
      })
    );
  }
}
