import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Intercom } from '@supy-io/ngx-intercom';

import { environment } from '@maptio-environment';
import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';

@Injectable()
export class AccessGuard {
  constructor(
    private router: Router,
    private intercom: Intercom,
    private userService: UserService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Observable<boolean> {
    const dataset = route.params['mapid'];
    const team = route.params['teamid'];

    return this.userService.user$.pipe(
      filter((user) => !!user),
      map((u) => {
        if (dataset && u.datasets.includes(dataset)) {
          this.updateIntercom(u.teams, u);
          return true;
        } else if (team && u.teams.includes(team)) {
          this.updateIntercom(u.teams, u);
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(childRoute, state);
  }

  private updateIntercom(teams: string[], user: User) {
    const nonExampleTeams = teams.filter(
      (t) => user.exampleTeamIds.findIndex((e) => e === t) < 0
    );

    if (nonExampleTeams.length === 1) {
      // we'll worry about consultants later

      nonExampleTeams.forEach((t) => {
        this.intercom.update({
          app_id: environment.INTERCOM_APP_ID,
          email: user.email,
          user_id: user.user_id,
          company: {
            company_id: t,
          },
        });
      });
    }
  }
}
