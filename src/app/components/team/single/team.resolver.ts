import { sortBy } from "lodash-es";
import { DatasetFactory } from "./../../../shared/services/dataset.factory";
import { DataSet } from "./../../../shared/model/dataset.data";
import { Auth } from "./../../../shared/services/auth/auth.service";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { TeamFactory } from "../../../shared/services/team.factory";
import { Team } from "../../../shared/model/team.data";

@Injectable()
export class TeamComponentResolver implements Resolve<{ team: Team, datasets: DataSet[] }> {

    constructor(private teamFactory: TeamFactory, private datasetFactory: DatasetFactory, private auth: Auth) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ team: Team, datasets: DataSet[] }> {

        let teamId: string = route.params["teamid"];
        let team = new Team({ team_id: teamId })

        return Observable.fromPromise(
            Promise.all([this.teamFactory.get(teamId), this.datasetFactory.get(team)])
                .then(result => {
                    let datasets = result[1]
                    datasets.map(d => {
                        let i = 0
                        d.initiative.traverse((n) => { i++ })
                        d.depth = i;
                        return d;
                    })
                    return { team: result[0], datasets: sortBy(datasets, d => d.initiative.name) }
                })
        )
    }

}
