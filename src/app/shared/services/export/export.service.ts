
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { DataSet } from "../../model/dataset.data";
import { D3Service, D3 } from "d3-ng2-service";
import { sortBy } from "lodash";
import { Tag } from "../../../shared/model/tag.data";
import {upperFirst, lowerCase,toLower} from "lodash"

@Injectable()
export class ExportService {

    private d3: D3;
    constructor(d3Service: D3Service) {
        this.d3 = d3Service.getD3();
    }

    getReport(dataset: DataSet): Observable<string> {
        let list = this.d3.hierarchy(dataset.initiative).descendants(); // flatten with lodash if possible
        let exportString: string = "Depth,Initiative,Parent Initiative,Type,Person,Participants,Helpers,Tags";

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

}
