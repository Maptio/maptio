import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

import {of as observableOf,  Observable } from 'rxjs';

import {mergeMap, map} from 'rxjs/operators';
import { Initiative } from './../../model/initiative.data';
import { SlackIntegration } from './../../model/integrations.data';
import { DataSet } from "../../model/dataset.data";
import { sortBy } from "lodash-es";
import { upperFirst, toLower } from "lodash-es"
import { hierarchy } from 'd3-hierarchy';

@Injectable()
export class ExportService {
    constructor(private http: HttpClient) {}

    getReport(dataset: DataSet): Observable<string> {
        let list = hierarchy(dataset.initiative).descendants(); // flatten with lodash if possible
        let exportString: string = "Depth,Circle,Parent Circle,Type,Person,Participants,Helpers,Tags";

        dataset.initiative.traverse(i => {
            let inList = list.find(l => l.data.id === i.id);
            let nbrHelpers = i.helpers.length;
            let nbrAll = nbrHelpers + (i.accountable ? 1 : 0);
            let tags = i.tags.map(t => t.name).join("/");

            exportString += `\n"${inList.depth}","${i.name}","${inList.parent.data.name}","${upperFirst(toLower(dataset.team.settings.authority))}","${i.accountable ? i.accountable.name : ""}","${nbrAll}","${nbrHelpers}","${tags}"`
            sortBy(i.helpers, "name").forEach(h => {
                exportString += `\n"${inList.depth}","${i.name}","${inList.parent.data.name}","${upperFirst(toLower(dataset.team.settings.helper))}","${h.name}","${nbrAll}","${nbrHelpers}","${tags}"`
            })

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

    getSnapshot(svgString: string, datasetId: string) {
        let headers = new HttpHeaders();
        headers.append("Content-Type", "text/html");
        headers.append("Accept", "text/html");
        let req = new HttpRequest(
          'POST',
          `/api/v1/images/upload/${datasetId}`,
          svgString,
          { headers }
        )
        return this.http.request(req).pipe(map((responseData) => {
            return <string>responseData['data'].eager[0].secure_url;
        }))
    }

    sendSlackNotification(svgString: string, datasetId: string, initiative: Initiative, slack: SlackIntegration, message: string) {
        return this.getSnapshot(svgString, datasetId).pipe(
            map((imageUrl: string) => {
                let attachments = [
                    {
                        color: "#2f81b7",
                        pretext: message,
                        title: `Changes to ${initiative.name}`,
                        title_link: `https://app.maptio.com/map/${datasetId}/${initiative.getSlug()}`,
                        image_url: imageUrl,
                        thumb_url: imageUrl,
                        footer: "Maptio",
                        footer_icon: "https://app.maptio.com/assets/images/logo.png",
                        // ts: Date.now()
                    }]

                let headers = new HttpHeaders();
                headers.append("Content-Type", "application/json");
                headers.append("Accept", "application/json");
                return new HttpRequest(
                  'POST',
                  '/api/v1/notifications/send',
                  {
                    url: slack.incoming_webhook.url,
                    attachments: attachments
                  },
                  { headers }
                );
            }),
            mergeMap(req => this.http.request(req)),
        );
    }

}
