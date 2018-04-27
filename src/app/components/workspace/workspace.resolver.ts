import { Observable } from "rxjs/Rx";
import { Auth } from "./../../shared/services/auth/auth.service";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { DataSet } from "../../shared/model/dataset.data";
import { Injectable } from "@angular/core";
import { TeamFactory } from "../../shared/services/team.factory";
import { User } from "../../shared/model/user.data";
import { compact, sortBy } from "lodash";
import { Team } from "../../shared/model/team.data";
import { UserFactory } from "../../shared/services/user.factory";
import { SelectableTag } from "../../shared/model/tag.data";

@Injectable()
export class WorkspaceComponentResolver implements Resolve<{ dataset: DataSet, team: Team, members: User[], user: User }> {

    constructor(private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private userFactory: UserFactory, private auth: Auth) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ dataset: DataSet, team: Team, members: User[], user: User }> {
        let datasetId = <string>route.params["mapid"];

        // return Observable.forkJoin(
          return   Observable.fromPromise(
                this.datasetFactory.get(datasetId)
                    .then((dataset: DataSet) => {
                        dataset.tags = dataset.tags.map(t => new SelectableTag(t)).map(t => { t.isSelected = false; return t });
                        return dataset;
                    })
                    .then((dataset: DataSet) => {
                        return this.teamFactory.get(dataset.initiative.team_id)
                            .then(
                            t => {
                                return { dataset: dataset, team: t }
                            })
                    })
                    .then(dt => {
                        return this.userFactory.getUsers(dt.team.members.map((m: User) => m.user_id))
                            .then(members => compact(members))
                            .then(members => sortBy(members, m => m.name))
                            .then(members => { return { dataset: dt.dataset, team: dt.team, members: sortBy(members, m => m.name) } })

                    })
            )
            .withLatestFrom(this.auth.getUser())
            .map(data => {
                    return { dataset: data[0].dataset, team: data[0].team, members: data[0].members, user: data[1] }
                })
        // )

    }

}
