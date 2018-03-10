import { Auth } from './../../../shared/services/auth/auth.service';

import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { TeamFactory } from "../../../shared/services/team.factory";
import { Team } from "../../../shared/model/team.data";

@Injectable()
export class TeamComponentResolver implements Resolve<Team> {

    constructor(private teamFactory: TeamFactory, private auth: Auth) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Team> {


        let teamId: string = route.params["teamid"];
        return Observable.fromPromise(this.teamFactory.get(teamId));

    }

}
