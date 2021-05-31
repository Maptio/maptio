
import {from as observableFrom,  Observable } from 'rxjs';
import { sortBy } from "lodash-es";
import { DatasetFactory } from "../../../../core/http/map/dataset.factory";
import { DataSet } from "../../../../shared/model/dataset.data";
import { Auth } from "../../../../core/authentication/auth.service";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { TeamFactory } from "../../../../core/http/team/team.factory";
import { Team } from "../../../../shared/model/team.data";

@Injectable()
export class TeamComponentResolver implements Resolve<{ team: Team, datasets: DataSet[] }> {

    constructor(private teamFactory: TeamFactory, private datasetFactory: DatasetFactory, private auth: Auth) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ team: Team, datasets: DataSet[] }> {

        let teamId: string = route.params["teamid"];
        let team = new Team({ team_id: teamId })

        return observableFrom(
            Promise.all([this.teamFactory.get(teamId), this.datasetFactory.get(team)])
                .then(result => {
                  
                    return { team: result[0], datasets: sortBy(result[1], d => d.initiative.name) }
                })
        )
    }

}
