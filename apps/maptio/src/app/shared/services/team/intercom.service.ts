import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { map } from 'rxjs/operators';
import { Team } from "../../../shared/model/team.data";
import { User } from "../../../shared/model/user.data";
import { Observable } from "rxjs";
import { Intercom } from "ng-intercom";


@Injectable()
export class IntercomService {

    constructor(private http: HttpClient, private intercom: Intercom) {}

    createTeam(user: User, team: Team): Observable<boolean> {
        const userUpdatePayload = {
            email: user.email,
            company: {
                company_id: team.team_id,
                name: team.name,
                created_at: Math.floor(Date.now() / 1000),
                custom_attributes: {
                    is_paying: false,
                    free_trial_length: 14
                }
            }
        };

        return this.http.post("/api/v1/intercom/user/update", userUpdatePayload).pipe(
            map((response: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                this.intercom.trackEvent("created a team", { id: team.team_id, name: team.name });
                return response;
            }),
            map((response: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                return response.statusCode === 200 || response.status === 200;
            }),
        );
    }

    sendEvent(eventName:string, data : any){
        this.intercom.trackEvent(eventName, data);
  }
}
