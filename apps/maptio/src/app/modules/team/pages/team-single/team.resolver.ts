import { from as observableFrom, Observable } from 'rxjs';
import { sortBy } from 'lodash-es';
import { DatasetFactory } from '../../../../core/http/map/dataset.factory';
import { DataSet } from '../../../../shared/model/dataset.data';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { TeamFactory } from '../../../../core/http/team/team.factory';
import { Team } from '../../../../shared/model/team.data';

@Injectable()
export class TeamComponentResolver
   {
  constructor(
    private teamFactory: TeamFactory,
    private datasetFactory: DatasetFactory
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<{ team: Team; datasets: DataSet[] }> {
    const teamId: string = route.params['teamid'];
    const team = new Team({ team_id: teamId });

    return observableFrom(
      Promise.all([
        this.teamFactory.get(teamId),
        this.datasetFactory.get(team),
      ]).then((result) => {
        return {
          team: result[0],
          datasets: sortBy(result[1], (d) => d.initiative.name),
        };
      })
    );
  }
}
