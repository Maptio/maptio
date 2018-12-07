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
import { Observable } from "rxjs/Observable";
import { UserService } from "../../shared/services/user/user.service";

@Injectable()
export class WorkspaceComponentResolver implements Resolve<{ dataset: DataSet, team: Team, members: User[], user: User }> {

    constructor(private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private userService:UserService,  private auth: Auth) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ dataset: DataSet, team: Team, members: User[], user: User }> {
        let datasetId = <string>route.params["mapid"];

        // return Observable.forkJoin(
        return Observable.fromPromise(
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
                    return this.userService.getUsersInfo(dt.team.members)
                        .then(members => compact(members))
                        .then(members => sortBy(members, m => m.name))
                        .then(members => { return { dataset: dt.dataset, team: dt.team, members: sortBy(members, m => m.name) } })

                })
                .then(dt => {
                    return this.auth.getUser().first().toPromise().then(u => { return { user: u, data: dt } })
                })
                .then(data => {
                    return { dataset: data.data.dataset, team: data.data.team, members: data.data.members, user: data.user }

                })
        )

    }

}
