// import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
// import { Auth } from "../../shared/services/auth/auth.service";
// import { DatasetFactory } from "../../shared/services/dataset.factory";
// import { DataSet } from "../../shared/model/dataset.data";
// import { Injectable } from "@angular/core";
// import { Observable } from "rxjs/Rx";
// import { TeamFactory } from "../../shared/services/team.factory";
// import { ErrorService } from "../../shared/services/error/error.service";
// import { User } from "../../shared/model/user.data";
// import { sortBy } from "lodash-es";
// import { Team } from "../../shared/model/team.data";

// @Injectable()
// export class DashboardComponentResolver implements Resolve<{datasets : DataSet[] , teams : Team[]}> {

//     constructor(public auth: Auth, public datasetFactory: DatasetFactory, public teamFactory: TeamFactory, public errorService: ErrorService) {
//     }

//     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{datasets : DataSet[] , teams : Team[]}> {

//         return this.auth.getUser()
//             .mergeMap((user: User) => {
//                 return Observable.forkJoin(this.datasetFactory.get(user.datasets), this.teamFactory.get(user.teams));
//             })
//             .map(([datasets, teams]: [DataSet[], Team[]]) => {
//                 return [
//                     datasets.map(d => {
//                         let i = 0
//                         d.initiative.traverse((n) => { i++ })
//                         d.depth = i;
//                         return d;
//                     }),
//                     teams
//                 ]
//             })
//             .do(([datasets, teams]: [DataSaet[], Team[]]) => {
//                 const promises = datasets
//                     .map(d => {
//                         return this.teamFactory.get(d.initiative.team_id).then((t) => { d.team = t; return d })
//                     });

//                 return Observable.forkJoin(promises);
//             })
//             .map(([datasets, teams]: [DataSet[], Team[]]) => {
//                 return {datasets: sortBy(datasets, d => d.initiative.name), teams: teams}
//             });
//     }

// }