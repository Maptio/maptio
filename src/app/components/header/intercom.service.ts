import { Injectable } from "@angular/core";
import { AuthHttp } from "angular2-jwt";
import { Response } from "@angular/http";
import { Observable } from "rxjs";
import { Team } from "../../shared/model/team.data";



@Injectable()
export class IntercomService {

    constructor(private http: AuthHttp) {
    }

    getTeamStatus(team: Team): Observable<{ created_at: Date, freeTrialLength: Number, isPaying: Boolean }> {
        return this.http.get(`/api/v1/intercom/team/${team.team_id}`)
            .map((response: Response) => {
                console.log(response.json())
                return response.json().body
            })
            .map(result => {
                return {
                    created_at: new Date(result.created_at*1000),
                    freeTrialLength: result.custom_attributes.free_trial_length,
                    isPaying: result.custom_attributes.is_paying
                }
            })
    }

}   