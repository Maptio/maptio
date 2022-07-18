import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { Team } from '@maptio-shared/model/team.data';
import { UserService } from '@maptio-shared/services/user/user.service';

@Injectable()
export class TeamListComponentResolver implements Resolve<Team[]> {
  constructor(private userService: UserService) {}

  resolve(): Observable<Team[]> {
    // TODO: This could be reactive, there's no need for this resolver,
    // really, but relying on the old code architecture to avoid propagating
    // all the reactive code changes throughout the codebase just yet - though
    // that is the eventual goal, just not in the current piece of work (auth
    // refactoring) where I'm making this change.
    return this.userService.userWithTeamsAndDatasets$.pipe(
      first(),
      map((userWithTeamsAndDatasets) => {
        return userWithTeamsAndDatasets.teams;
      })
    );
  }
}
