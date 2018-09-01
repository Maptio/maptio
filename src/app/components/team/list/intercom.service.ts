import { Injectable } from "@angular/core";
import { AuthHttp } from "angular2-jwt";
import { Team } from "../../../shared/model/team.data";
import { User } from "../../../shared/model/user.data";
import { Response } from "@angular/http";
import { Observable } from "../../../../../node_modules/rxjs";



@Injectable()
export class IntercomService {

    constructor(private http: AuthHttp) {
    }

    createTeam(user: User, team: Team): Observable<boolean> {
        return this.http.post("/api/v1/intercom/user/update", {
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
        })
            .map((response: Response) => {
                return response.status === 200
            })
    }
}   