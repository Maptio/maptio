import { UserService } from "./../../../shared/services/user/user.service";
import { User } from "./../../../shared/model/user.data";
import { Auth } from "./../../../shared/services/auth/auth.service";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { TeamFactory } from "../../../shared/services/team.factory";
import { Team } from "../../../shared/model/team.data";
import { differenceBy, sortBy, isEmpty } from "lodash"

@Injectable()
export class TeamListComponentResolver implements Resolve<Team[]> {

    constructor(private teamFactory: TeamFactory, private auth: Auth, private userService: UserService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Team[]> {
        return this.auth.getUser().first()
            .mergeMap(user => isEmpty(user.teams) ? [] : this.teamFactory.get(user.teams))
            .map((teams: Team[]) => {
                teams.forEach(t => {
                    if (t) {
                        this.userService.getUsersInfo(t.members).then((actualMembers: User[]) => {
                            let allDeleted = differenceBy(t.members, actualMembers, m => m.user_id).map(m => { m.isDeleted = true; return m });
                            return actualMembers.concat(allDeleted);
                        })
                            .then(members => t.members = sortBy(members, m => m.name))
                    }
                })
                return teams.filter(t => { return t !== undefined });
            })
            .map(teams => {
                return sortBy(teams, t => t.name)
            })
    }

}
