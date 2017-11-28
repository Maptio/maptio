import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Auth } from "../../shared/services/auth/auth.service";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { DataSet } from "../../shared/model/dataset.data";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { TeamFactory } from "../../shared/services/team.factory";
import { ErrorService } from "../../shared/services/error/error.service";
import { User } from "../../shared/model/user.data";
import { compact, sortBy } from "lodash";
import { Team } from "../../shared/model/team.data";
import { UserFactory } from "../../shared/services/user.factory";

@Injectable()
export class WorkspaceComponentResolver implements Resolve<{ dataset: DataSet, team: Team, members: User[] }> {

    constructor(private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private userFactory: UserFactory) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ dataset: DataSet, team: Team, members: User[] }> {
        let datasetId = route.params["mapid"];
        return Observable.fromPromise(
            this.datasetFactory.get(datasetId)
                .then((dataset: DataSet) => {
                    return this.teamFactory.get(dataset.initiative.team_id)
                        .then(
                        t => {
                            return { dataset: dataset, team: t }
                        })
                })
                .then(dt => {
                    return this.userFactory.getUsers(dt.team.members.map(m => m.user_id))
                        .then(members => compact(members))
                        .then(members => sortBy(members, m => m.name))
                        .then(members => { return { dataset: dt.dataset, team: dt.team, members: sortBy(members, m => m.name) } })

                })
        );

    }

}
