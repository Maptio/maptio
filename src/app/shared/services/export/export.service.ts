
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { DataSet } from "../../model/dataset.data";
import { D3Service, D3 } from "d3-ng2-service";

@Injectable()
export class ExportService {

    private d3: D3;
    constructor(d3Service: D3Service) {
        this.d3 = d3Service.getD3();
    }

    getReport(dataset: DataSet): Observable<string> {
        let list = this.d3.hierarchy(dataset.initiative).descendants();
        let exportString: string = "Initiative,Authority,Helpers";

        dataset.initiative.traverse(i => {
            let inList = list.find(l => l.data.id === i.id);
            exportString += `\n"${Array((inList.depth - 1) * 5).join(String.fromCharCode(32))}${i.name}","${i.accountable ? i.accountable.name : ""}",${i.helpers.map(h => `"${h.name}"`).join(",")}`
        });
        return Observable.of(exportString);
    }

}