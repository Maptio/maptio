import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

import { of as observableOf, Observable } from 'rxjs';

import { mergeMap, map } from 'rxjs/operators';
import { Initiative } from './../../model/initiative.data';
import { SlackIntegration } from './../../model/integrations.data';
import { DataSet } from '../../model/dataset.data';
import { sortBy } from 'lodash-es';
import { upperFirst, toLower } from 'lodash-es';
import { hierarchy } from 'd3-hierarchy';

@Injectable()
export class ExportService {
  constructor(private http: HttpClient) {}

  getReport(dataset: DataSet): Observable<string> {
    const list = hierarchy(dataset.initiative).descendants(); // flatten with lodash if possible
    let exportString =
      'Depth,Circle,Parent Circle,Type,Person,Participants,Helpers,Tags';

    dataset.initiative.traverse((i) => {
      const inList = list.find((l) => l.data.id === i.id);
      const nbrHelpers = i.helpers.length;
      const nbrAll = nbrHelpers + (i.accountable ? 1 : 0);
      const tags = i.tags.map((t) => t.name).join('/');

      exportString += `\n"${inList.depth}","${i.name}","${
        inList.parent.data.name
      }","${upperFirst(toLower(dataset.team.settings.authority))}","${
        i.accountable ? i.accountable.name : ''
      }","${nbrAll}","${nbrHelpers}","${tags}"`;
      sortBy(i.helpers, 'name').forEach((h) => {
        exportString += `\n"${inList.depth}","${i.name}","${
          inList.parent.data.name
        }","${upperFirst(toLower(dataset.team.settings.helper))}","${
          h.name
        }","${nbrAll}","${nbrHelpers}","${tags}"`;
      });
    });
    return observableOf(exportString);
  }

  // getSlackChannels(slack: SlackIntegration) {
  //     let request = new Request({
  //         url: `https://slack.com/api/channels.list?token=${slack.access_token}`,
  //         method: RequestMethod.Get
  //     })

  //     return this.http.request(request).map((responseData) => {
  //         let response = responseData.json();
  //         if (response.ok) {
  //             return response.channels;
  //         }
  //         else {
  //             throw new Error("Cannot retrieve slack channels!")
  //         }
  //     })
  // }
}
