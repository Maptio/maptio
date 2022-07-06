import { Injectable } from '@angular/core';
import { DatasetFactory } from '../../../core/http/map/dataset.factory';
import { Intercom } from 'ng-intercom';
import { Initiative } from '../../model/initiative.data';

import { DataSet } from '@maptio-shared/model/dataset.data';
import { User } from '@maptio-shared/model/user.data';

@Injectable()
export class MapService {
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

    // console.log('Remote version last edited at', remoteDataset.lastEditedAt);
    // console.log('Remote version last edited by', remoteDataset.lastEditedBy);
    // console.log('Current version last edited at', localDataset.lastEditedAt);
    // console.log('Current version last edited by', localDataset.lastEditedBy);

    if (remoteDataset.lastEditedAt !== localDataset.lastEditedAt) {
      alert(
        'A friendly heads-up: Your map has been changed by another user (or by you in a different browser tab). Please hit refresh to load the latest version, then you can make your edits. You can copy any text you just entered, ready to paste it in again after the refresh. Sorry for the hassle.'
      );
      return true;
    } else {
      localDataset.lastEditedAt = new Date().getTime();
      localDataset.lastEditedBy = user;
    }

    return false;
  }

  archive(dataset: DataSet) {
    dataset.isArchived = true;
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
