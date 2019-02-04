import { Auth } from "../../core/authentication/auth.service";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { DatasetFactory } from "../../core/http/map/dataset.factory";
import { DataSet } from "../../shared/model/dataset.data";
import { Injectable } from "@angular/core";
import { TeamFactory } from "../../core/http/team/team.factory";
import { User } from "../../shared/model/user.data";
import { compact, sortBy } from "lodash-es";
import { Team } from "../../shared/model/team.data";
import { UserFactory } from "../../core/http/user/user.factory";
import { SelectableTag } from "../../shared/model/tag.data";
import { Observable } from "rxjs/Observable";
import { UserService } from "../../shared/services/user/user.service";
import { from } from "rxjs";
import { map, flatMap } from "rxjs/operators"

@Injectable()
export class WorkspaceComponentResolver implements Resolve<{ dataset: DataSet, team: Team, members: User[], user: User }> {

    constructor(private datasetFactory: DatasetFactory, private teamFactory: TeamFactory, private userService: UserService, private userFactory: UserFactory, private auth: Auth) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ dataset: DataSet, team: Team, members: User[], user: User }> {
        let datasetId = <string>route.params["mapid"];

        return from(this.datasetFactory.get(datasetId))
            .pipe(
                map((dataset: DataSet) => {
                    dataset.tags = dataset.tags.map(t => new SelectableTag(t)).map(t => { t.isSelected = false; return t });
                    return dataset;
                }),
                flatMap((dataset: DataSet) => {
                    return this.teamFactory.get(dataset.initiative.team_id)
                        .then(
                            t => {
                                return { dataset: dataset, team: t }
                            })
                }),
                flatMap(dt => {
                    return Promise.all([this.userService.getUsersInfo(dt.team.members), this.userFactory.getUsers(dt.team.members.map(m => m.user_id))])
                        .then(([auth0Users, databaseUsers]: [User[], User[]]) => {
                            return databaseUsers.map(u => {
                                u.picture = auth0Users.find(du => du.user_id === u.user_id) ? auth0Users.find(du => du.user_id === u.user_id).picture : u.picture;
                                return u;
                            })
                        })
                        .then(members => compact(members))
                        .then(members => sortBy(members, m => m.name))
                        .then(members => { return { dataset: dt.dataset, team: dt.team, members: members } })


                }),
                flatMap(dt => {
                    return this.auth.getUser().first().toPromise().then(u => { return { user: u, data: dt } })

                }),
                map(data => {
                    return { dataset: data.data.dataset, team: data.data.team, members: data.data.members, user: data.user }
                }
                )
            )
    }
}
