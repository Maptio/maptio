import { Injectable } from '@angular/core';
import { DatasetFactory } from '../../../core/http/map/dataset.factory';
import { Intercom } from 'ng-intercom';
import { Initiative } from '../../model/initiative.data';

import { DataSet } from '@maptio-shared/model/dataset.data';
import { User } from '@maptio-shared/model/user.data';

@Injectable()
export class MapService {
  lastOutdatedSaveDatasetLastEditedAt: number;
  lastOutdatedSaveAlertTime: number;

  constructor(
    private datasetFactory: DatasetFactory,
    private intercom: Intercom
  ) {}

  private create(dataset: DataSet) {
    return this.datasetFactory.create(dataset);
  }

  get(datasetId: string): Promise<DataSet> {
    return this.datasetFactory.get(datasetId);
  }

  /*
   * Workaround for handling multiple people editing at the same time
   */
  async isDatasetOutdated(localDataset: DataSet, user?: User) {
    const datasetId = localDataset.datasetId;

    const remoteDataset = await this.datasetFactory.get(datasetId);

    if (remoteDataset.lastEditedAt !== localDataset.lastEditedAt) {
      return true;
    } else {
      localDataset.lastEditedAt = new Date().getTime();
      localDataset.lastEditedBy = user;
      return false;
    }
  }

  /**
   * Use this to prevent too many alerts from being shown one right after
   * another in cases when that is likely because of how data saves are
   * triggered.
   */
  hasOutdatedAlertBeenShownRecently(localDataset: DataSet) {
    const alertRepetitionDelay = 3000;

    const isSaveAttemptWithinRepetitionDelay =
      Date.now() < this.lastOutdatedSaveAlertTime + alertRepetitionDelay;
    const isAlertAboutTheSameChange =
      this.lastOutdatedSaveDatasetLastEditedAt === localDataset.lastEditedAt;

    if (isAlertAboutTheSameChange && isSaveAttemptWithinRepetitionDelay) {
      // Alert has been shown recently, so should not be shown again
      return true;
    }

    // Make a note of what version of the dataset we're showing the alert for
    this.lastOutdatedSaveDatasetLastEditedAt = localDataset.lastEditedAt;

    // Alert has not been shown recently, so it should be shown now
    this.lastOutdatedSaveAlertTime = Date.now();
    return false;
  }

  archive(dataset: DataSet) {
    dataset.isArchived = true;
    // TODO: Add map lock - or remove, this is never used, right?
    return this.datasetFactory.upsert(dataset).then((archived) => {
      if (archived) return dataset;
    });
  }

  /*
   * Creating template, example, and empty datasets
   */

  createTemplate(name: string, teamId: string) {
    const template = new DataSet({
      initiative: new Initiative({
        name: name,
        team_id: teamId,
        children: [
          new Initiative({
            name: 'Outer circle',
            description:
              "Use this area to explain more about what this circle does and link out to other tools, systems and documents that you're using.",
            team_id: teamId,
            id: Math.floor(Math.random() * 10000000000000),
            children: [
              new Initiative({
                name: 'Sub-circle 1',
                description:
                  'Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.',
                team_id: teamId,
                id: Math.floor(Math.random() * 10000000000000),
              }),
              new Initiative({
                name: 'Sub-circle 2',
                description:
                  'Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.',
                team_id: teamId,
                id: Math.floor(Math.random() * 10000000000000),
              }),
              new Initiative({
                name: 'Sub-circle 3',
                description:
                  'Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.',
                team_id: teamId,
                id: Math.floor(Math.random() * 10000000000000),
              }),
            ],
          }),
        ],
      }),
    });

    return this.create(template);
  }

  createExample(teamId: string) {
    return this.datasetFactory.createDemo(teamId).toPromise();
  }

  createEmpty(name: string, teamId: string) {
    const empty = new DataSet({
      initiative: new Initiative({
        name: name,
        team_id: teamId,
      }),
    });
    return this.create(empty);
  }
}
