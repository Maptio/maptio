import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Intercom } from 'ng-intercom';

import { environment } from '@maptio-config/environment';
import { User } from '@maptio-shared/model/user.data';
import { Auth } from '../authentication/auth.service';


@Injectable()
export class AccessGuard implements CanActivate, CanActivateChild {
  constructor(
    private auth: Auth,
    private router: Router,
    private intercom: Intercom
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot, // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Observable<boolean> {
    const dataset = route.params['mapid'];
    const team = route.params['teamid'];

    return this.auth.getUser().pipe(
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
