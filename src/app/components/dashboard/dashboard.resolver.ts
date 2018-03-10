import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Auth } from "../../shared/services/auth/auth.service";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { DataSet } from "../../shared/model/dataset.data";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { TeamFactory } from "../../shared/services/team.factory";
import { ErrorService } from "../../shared/services/error/error.service";
import { User } from "../../shared/model/user.data";
import {  sortBy } from "lodash";

@Injectable()
export class DashboardComponentResolver implements Resolve<Array<DataSet>> {

    constructor(public auth: Auth, public datasetFactory: DatasetFactory, public teamFactory: TeamFactory, public errorService: ErrorService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DataSet[]> {

        return this.auth.getUser()
            .mergeMap((user: User) => {
                return this.datasetFactory.get(user.datasets);
            })
            .map((datasets: DataSet[]) => {
                return datasets.map(d => {
                    let i = 0
                    d.initiative.traverse((n) => { i++ })
                    d.depth = i;
                    return d;
                })
            })
            .mergeMap(datasets => {
                const promises = datasets
                    .map(d => {
                        return this.teamFactory.get(d.initiative.team_id).then((t) => { d.team = t; return d })
                    });

                return Observable.forkJoin(promises);
            })
            .map(datasets => {
                return sortBy(datasets, d => d.initiative.name)
            });
    }

}