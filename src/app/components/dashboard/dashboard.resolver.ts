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

@Injectable()
export class DashboardComponentResolver implements Resolve<Array<DataSet>> {

    constructor(public auth: Auth, public datasetFactory: DatasetFactory, public teamFactory: TeamFactory, public errorService: ErrorService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DataSet[]> {

        return this.auth.getUser().take(1)
            .map((user: User) => {
                // console.log("1", user.datasets)
                return user.datasets;
            })
            .mergeMap(datasetsIds => {
                // console.log("2", datasetsIds)
                const promises = datasetsIds
                    .map(did => {
                        return this.datasetFactory.get(did)
                            .then(d => d, () => { return <DataSet>undefined })
                    });
                return Observable.forkJoin(promises);
            })
            .map(datasets => {
                // console.log("3", datasets)
                return compact(datasets);
            })
            .do(datasets => {
                // console.log("4", datasets)
                datasets.map(d => {
                    let i = 0
                    d.initiative.traverse((n) => { i++ })
                    d.depth = i;
                    return d;
                })
            })
            .mergeMap(datasets => {
                // console.log("5", datasets)
                const promises = datasets
                    .map(d => {
                        return this.teamFactory.get(d.initiative.team_id).then((t) => { d.team = t; return d })
                    });

                return Observable.forkJoin(promises);
            })
            .map(datasets => {
                // console.log("6", datasets.map(d => d.team))
                return sortBy(datasets, d => d.initiative.name)
            });
    }

}