
import {map} from 'rxjs/operators';
import { Injectable } from "@angular/core";
import { AuthHttp } from "angular2-jwt";
import { Response } from "@angular/http";
import { Observable } from "rxjs";
import { Team } from "../../model/team.data";



@Injectable()
export class BillingService {

    constructor(private http: AuthHttp) {
    }

    getTeamStatus(team: Team): Observable<{ created_at: Date, freeTrialLength: Number, isPaying: Boolean, plan: string, maxMembers: number, price: number }> {
        return this.http.get(`/api/v1/intercom/team/${team.team_id}`).pipe(
            map((response: Response) => {
                return response.json().statusCode == 200 ? response.json().body : null
            }),
            map(result => {
                return result
                    ? {
                        created_at: new Date(result.created_at * 1000),
                        freeTrialLength: result.custom_attributes.free_trial_length,
                        isPaying: result.custom_attributes.is_paying,
                        plan: result.plan.name,
                        maxMembers: result.custom_attributes.plan_limit,
                        price: result.monthly_spend
                    }
                    : {
                        created_at: new Date(),
                        freeTrialLength: -1,
                        isPaying: true,
                        plan: "",
                        maxMembers: null,
                        price: null
                    }
            }),)
    }

}   