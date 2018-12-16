import { Injectable } from '@angular/core';
import { DatasetFactory } from '../dataset.factory';
import { DataSet } from '../../model/dataset.data';
import { Intercom } from 'ng-intercom';
import { Initiative } from '../../model/initiative.data';

@Injectable()
export class MapService {


    constructor(private datasetFactory: DatasetFactory, private intercom: Intercom) { }

    private create(dataset: DataSet) {
        return this.datasetFactory.create(dataset)
    }

    createTemplate(name: string, teamId: string) {
        let template = new DataSet({
            initiative: new Initiative({
                name: name,
                team_id: teamId,
                children: [
                    new Initiative({
                        name: "This is your outer circle. A great place to put a short version of your mission or vision",
                        description: "This is the description of the circle. Use this to explain more about what this circle does and link out to other tools, systems and documents that you're using.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it.",
                        team_id: teamId,
                        id: Math.floor(Math.random() * 10000000000000),
                        children: [
                            new Initiative({
                                name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                team_id: teamId,
                                id: Math.floor(Math.random() * 10000000000000),
                            }),
                            new Initiative({
                                name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                team_id: teamId,
                                id: Math.floor(Math.random() * 10000000000000),
                                children: [
                                    new Initiative({
                                        name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                        description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                        team_id: teamId,
                                        id: Math.floor(Math.random() * 10000000000000),
                                    }),
                                    new Initiative({
                                        name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                        description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                        team_id: teamId,
                                        id: Math.floor(Math.random() * 10000000000000),
                                    })
                                ]
                            }),
                            new Initiative({
                                name: "This is a sub-circle, perhaps representing a major initiative in the organisation",
                                description: "Sub-circles are just circles that appear within another circle. You can have sub-circles many levels deep.\n\n**You can right-click (or ctrl+click on a Mac) any circle on the map to edit its details.**\n\nWhen you edit the circle you can specify who's working on it and also add tags to it.",
                                team_id: teamId,
                                id: Math.floor(Math.random() * 10000000000000),
                            }),
                        ]
                    })
                ]
            })
        });

        return this.create(template);
    }

    createExample(teamId: string) {
        return this.datasetFactory.createDemo(teamId).toPromise();
    }

    createEmpty(name: string, teamId: string) {
        let empty = new DataSet({
            initiative: new Initiative({
                name: name,
                team_id: teamId
            })
        });
        return this.create(empty);
    }

    get(datasetId: string): Promise<DataSet> {
        return this.datasetFactory.get(datasetId);
    }

    archive(dataset: DataSet) {
        dataset.isArchived = true;
        return this.datasetFactory.upsert(dataset)
            .then(archived => {
                if (!!archived) return dataset;
            })
    }

}