
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { DataSet } from "../../model/dataset.data";
import { D3Service, D3 } from "d3-ng2-service";
import { sortBy } from "lodash";

@Injectable()
export class ExportService {

    private d3: D3;
    constructor(d3Service: D3Service) {
        this.d3 = d3Service.getD3();
    }

    getReport(dataset: DataSet): Observable<string> {
        let list = this.d3.hierarchy(dataset.initiative).descendants();
        let exportString: string = "Depth,Initiative,Parent Initiative,Type,Person,Participants,Helpers";

        dataset.initiative.traverse(i => {
            let inList = list.find(l => l.data.id === i.id);
            let nbrHelpers = i.helpers.length;
            let nbrAll = nbrHelpers + (i.accountable ? 1 : 0);
            exportString += `\n"${inList.depth}","${i.name}","${inList.parent.data.name}","Authority","${i.accountable ? i.accountable.name : ""}","${nbrAll}","${nbrHelpers}"`
            sortBy(i.helpers, "name").forEach(h => {
                exportString += `\n"${inList.depth}","${i.name}","${inList.parent.data.name}","Helpers","${h.name}","${nbrAll}","${nbrHelpers}"`
            })
        });
        return Observable.of(exportString);
    }

}