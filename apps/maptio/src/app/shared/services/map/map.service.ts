import { Injectable } from '@angular/core';
import { DatasetFactory } from '../../../core/http/map/dataset.factory';
import { DataSet } from '../../model/dataset.data';
import { Intercom } from 'ng-intercom';
import { Initiative } from '../../model/initiative.data';

@Injectable()
export class MapService {
  constructor(
    private datasetFactory: DatasetFactory,
    private intercom: Intercom
  ) {}

  private create(dataset: DataSet) {
    return this.datasetFactory.create(dataset);
  }

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

  get(datasetId: string): Promise<DataSet> {
    return this.datasetFactory.get(datasetId);
  }

  archive(dataset: DataSet) {
    dataset.isArchived = true;
    return this.datasetFactory.upsert(dataset).then((archived) => {
      if (archived) return dataset;
    });
  }
}
