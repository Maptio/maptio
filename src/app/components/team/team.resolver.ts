
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { DataSet } from "../../shared/model/dataset.data";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { TeamFactory } from "../../shared/services/team.factory";
import { User } from "../../shared/model/user.data";
import { compact, sortBy } from "lodash";
import { Team } from "../../shared/model/team.data";
import { UserFactory } from "../../shared/services/user.factory";
import { SelectableTag, DEFAULT_TAGS } from "../../shared/model/tag.data";

@Injectable()
export class TeamComponentResolver implements Resolve<Team> {

    constructor(public teamFactory: TeamFactory) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Team> {
        let teamId: string = route.params["teamid"];
        return Observable.fromPromise(this.teamFactory.get(teamId));

    }

}
