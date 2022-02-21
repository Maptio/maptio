import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { Observable } from 'rxjs';
import { map, mergeMap, first } from 'rxjs/operators';

import { differenceBy, sortBy, isEmpty } from 'lodash-es';

import { Auth } from '@maptio-core/authentication/auth.service';
import { TeamFactory } from '@maptio-core/http/team/team.factory';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';


@Injectable()
export class TeamListComponentResolver implements Resolve<Team[]> {
  constructor(
    private teamFactory: TeamFactory,
    private auth: Auth,
    private userService: UserService
  ) {}

  resolve(): Observable<Team[]> {
    return this.auth.getUser().pipe(
      first(),
      mergeMap((user) => {
        return isEmpty(user.teams)
          ? Promise.resolve([])
          : this.teamFactory.get(user.teams);
      }),
      map((teams: Team[]) => {
        teams.forEach((team) => {
          if (team) {
            this.userService
              .getUsersInfo(team.members)
              .then((actualMembers: User[]) => {
                const allDeleted = differenceBy(
                  team.members,
                  actualMembers,
                  (member) => member.user_id
                ).map((member) => {
                  member.isDeleted = true;
                  return member;
                });
                return actualMembers.concat(allDeleted);
              })
              .then((members) => (team.members = sortBy(members, (member) => member.name)));
          }
        });
        return teams.filter((team) => {
          return team !== undefined;
        });
      }),
      map((teams) => {
        return sortBy(teams, (team) => team.name);
      })
    );
  }
}
