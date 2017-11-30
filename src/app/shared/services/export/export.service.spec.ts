import { Http, BaseRequestOptions, RequestMethod, ResponseOptions, Response } from "@angular/http";
import { TestBed, inject } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { ExportService } from "./export.service";
import { D3Service } from "d3-ng2-service";
import { DataSet } from "../../model/dataset.data";
import { Initiative } from "../../model/initiative.data";

describe("export.service.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ExportService, D3Service
            ]
        });
    })

    beforeAll(() => {
        fixture.setBase("src/app/shared/services/export/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });

    it("exports", inject([ExportService, D3Service], (target: ExportService, d3Service: D3Service) => {
        let d3 = d3Service.getD3();
        let data = new Initiative().deserialize(fixture.load("data.json"));
        let dataset = new DataSet({ _id: "ID", initiative: data });
        target.getReport(dataset).subscribe(exported => {
            expect(exported.split(`\n`).length).toBe(3);
            expect(exported.split(`\n`)[0]).toBe("Initiative,Authority,Helpers");
            expect(exported.split(`\n`)[1]).toBe(`"Tech","CTO",CTO1,CTO2`);
            expect(exported.split(`\n`)[2]).toBe(`"Marketing","CMO",CMO1,CMO2`);
        })
    }))

});