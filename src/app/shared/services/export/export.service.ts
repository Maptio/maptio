import { Initiative } from './../../model/initiative.data';
import { SlackIntegration } from './../../model/integrations.data';
import { RequestMethod, RequestOptions, Request, Headers } from "@angular/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { DataSet } from "../../model/dataset.data";
import { sortBy } from "lodash-es";
import { upperFirst, lowerCase, toLower } from "lodash-es"
import { hierarchy } from 'd3-hierarchy';

@Injectable()
export class ExportService {

    constructor( private http: AuthHttp) {
    }

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
        return Observable.of(exportString);
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
