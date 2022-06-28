import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Team } from '../../../shared/model/team.data';
import * as shortid from 'shortid';

@Injectable()
export class TeamFactory {
  constructor(private http: HttpClient) {}

  /**
   *  Retrieves a list team matching given ids
   * @param id List of team ids
   */
  get(ids: string[]): Promise<Team[]>;
  /**
   *  Retrieves a dataset matching a given id
   * @param id Unique team id
   */
  get(id: string): Promise<Team>;

  get(idOrIds: string | string[]): Promise<Team> | Promise<Team[]> {
    if (!idOrIds)
      return Promise.reject('Parameter missing - team') as Promise<Team>;
    if (idOrIds.constructor === Array) {
      return this.getWithIds(<string[]>idOrIds);
    }
    return this.getWithId(<string>idOrIds);
  }

  /** Gets a team using its uniquerId
   *  Returns undefined if no user is found
   */
  private getWithId(uniqueId: string): Promise<Team> {
    if (uniqueId) {
      return this.http
        .get('/api/v1/team/' + uniqueId)
        .pipe(
          map((response: Response) => {
            return Team.create().deserialize(response);
          })
        )
        .toPromise();
    } else {
      return Promise.reject('No team_id provided');
    }
  }

  private getWithIds(teamIds: string[]): Promise<Team[]> {
    if (!teamIds || teamIds.length === 0) {
      return Promise.reject('You cannot make a search for all teams !');
    }
    return this.http
      .get('/api/v1/team/in/' + teamIds.join(','))
      .pipe(
        map((inputs: Array<any>) => {
          let result: Array<Team> = [];
          if (inputs) {
            inputs.forEach((input) => {
              result.push(Team.create().deserialize(input));
            });
          }
          return result;
        })
      )
      .toPromise();
  }

  /**
   * Creates a new team
   */
  create(input: Team): Promise<Team> {
    let transformed = {
      shortid: shortid.generate(),
      team_id: input.team_id,
      name: input.name,
      slack: input.slack,
      isTemporary: input.isTemporary,
      isExample: input.isExample,
      roles: input.roles,
      members: input.members.map((m) => {
        return {
          name: m.name,
          picture: m.picture,
          user_id: m.user_id,
          nickname: m.nickname,
        };
      }),
    };

    return this.http
      .post('/api/v1/team', transformed)
      .pipe(
        map((input: any) => {
          return Team.create().deserialize(input);
        })
      )
      .toPromise();
  }

  /**
   * Upsert a team
   * @param   team    User to update or insert
   * @returns         True if upsert has succeded, false otherwise
   */
  upsert(team: Team): Promise<boolean> {
    let transformed = {
      team_id: team.team_id,
      name: team.name,
      settings: team.settings,
      slack: team.slack,
      isTemporary: team.isTemporary,
      isExample: team.isExample,
      roles: team.roles,
      members: team.members.map((m) => {
        return {
          name: m.name,
          picture: m.picture,
          user_id: m.user_id,
          nickname: m.nickname,
        };
      }),
    };
    return this.http
      .put('/api/v1/team/' + team.team_id, transformed)
      .toPromise()
      .then((r) => true)
      .catch(() => false);
  }
}
