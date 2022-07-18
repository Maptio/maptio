import { Injectable } from '@angular/core';
import { TeamFactory } from '../../../core/http/team/team.factory';
import { UserFactory } from '../../../core/http/user/user.factory';
import { User } from '../../model/user.data';
import { Team } from '../../model/team.data';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { IntercomService } from './intercom.service';

import { remove } from 'lodash-es';

import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { DataSet } from '@maptio-shared/model/dataset.data';

@Injectable()
export class TeamService {
  constructor(
    private teamFactory: TeamFactory,
    private userFactory: UserFactory,
    private datasetFactory: DatasetFactory,
    private analytics: Angulartics2Mixpanel,
    private intercomService: IntercomService
  ) {}

  create(
    name: string,
    user: User,
    members?: User[],
    isTemporary?: boolean,
    isExample?: boolean
  ) {
    return this.teamFactory
      .create(
        new Team({
          name: name,
          members: members,
          isTemporary: isTemporary,
          isExample: isExample,
          freeTrialLength: 14,
          isPaying: false,
        })
      )
      .then(
        (team: Team) => {
          user.teams.push(team.team_id);
          return this.userFactory
            .upsert(user)
            .then(
              (result: boolean) => {
                if (result) {
                  if (!isTemporary && !isExample) {
                    this.analytics.eventTrack('Create team', {
                      email: user.email,
                      name: name,
                      teamId: team.team_id,
                    });
                  }
                } else {
                  throw `Unable to add you to organisation ${name}!`;
                }
              },
              () => {
                throw `Unable to create organisation ${name}!`;
              }
            )
            .then(() => {
              return team;
            });
        },
        () => {
          throw `Unable to create organisation ${name}!`;
        }
      )
      .then((team: Team) => {
        if (!isExample) {
          return this.intercomService
            .createTeam(user, team)
            .toPromise()
            .then((result) => {
              if (result) return team;
              else throw 'Cannot sync organisation with Intercom.';
            });
        } else {
          return team;
        }
      });
  }

  createTemporary(user: User) {
    return this.create('', user, [], true, false);
  }

  renameTemporary(team: Team, name: string) {
    if (!name) return Promise.reject('Organisation name cannot be empty');
    team.name = name;
    team.isTemporary = false;
    return this.teamFactory.upsert(team);
  }

  save(team: Team) {
    if (!team.name) return Promise.reject('Organisation name cannot be empty');
    return this.teamFactory.upsert(team).then((saved) => {
      if (saved) return team;
    });
  }

  exist(team: Team): Promise<boolean> {
    return this.teamFactory
      .get(team.team_id)
      .then((team) => !!team)
      .catch(() => false);
  }

  get(user: User) {
    return this.teamFactory.get(user.teams);
  }

  saveTerminology(team: Team, name: string, authority: string, helper: string) {
    if (!name) return Promise.reject('Organisation name cannot be empty');

    team.name = name;
    team.settings = { authority: authority, helper: helper };

    return this.teamFactory.upsert(team).then((isUpdated: boolean) => {
      if (isUpdated) {
        this.intercomService.sendEvent('Change terminology', {
          team: team.name,
          teamId: team.team_id,
          authority: team.settings.authority,
          helper: team.settings.helper,
        });
        return team;
      } else {
        throw 'Error while updating the organisation';
      }
    });
  }

  async removeMember(team: Team, user: User): Promise<boolean> {
    if (team.members.length === 1) {
      return;
    }

    remove(team.members, function (member) {
      return member.user_id === user.user_id;
    });

    let success: boolean;

    try {
      success = await this.teamFactory.upsert(team);
    } catch {
      throw new Error(`
        Encountered an error while updating team object after removing a team
        member.
      `);
    }

    return success;
  }

  async addMember(team: Team, user: User): Promise<boolean> {
    let success: boolean;
    let teamDatasets: DataSet[];

    user.teams.push(team.team_id);

    try {
      teamDatasets = await this.datasetFactory.get(team);
    } catch {
      throw new Error(`
        Encountered an error while fetching datasets for a team to add a member
        to the team.
      `);
    }

    const teamDatasetIds = teamDatasets.map((dataset) => dataset.datasetId);
    user.datasets = user.datasets.concat(teamDatasetIds);

    try {
      success = await this.userFactory.upsert(user);
    } catch {
      throw new Error(`
        Encountered an error while updating user object after adding member to
        team.
      `);
    }

    team.members.push(user);

    try {
      success = await this.teamFactory.upsert(team);
    } catch {
      throw new Error(`
        Encountered an error while updating team object after removing a team
        member.
      `);
    }

    return success;
  }

  async replaceMember(
    team: Team,
    memberToBeReplaced: User,
    memberToBeAdded: User
  ): Promise<boolean> {
    this.removeMember(team, memberToBeReplaced);

    const isMemberToBeAddedAlreadyInTeam = team.members.some(
      (member) => member.user_id === memberToBeAdded.user_id
    );

    if (!isMemberToBeAddedAlreadyInTeam) {
      return this.addMember(team, memberToBeAdded);
    } else {
      return this.teamFactory.upsert(team);
    }
  }
}
