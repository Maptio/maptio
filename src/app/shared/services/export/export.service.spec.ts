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
        let dataset = new DataSet({ datasetId: "ID", initiative: data });
        target.getReport(dataset).subscribe(exported => {
            expect(exported.split(`\n`).length).toBe(7);
            expect(exported.split(`\n`)[0]).toBe("Depth,Initiative,Parent Initiative,Type,Person,Participants,Helpers");
            expect(exported.split(`\n`)[1]).toBe(`"1","Tech","My Company","Authority","CTO","3","2"`);
            expect(exported.split(`\n`)[2]).toBe(`"1","Tech","My Company","Helpers","CTO1","3","2"`);
            expect(exported.split(`\n`)[3]).toBe(`"1","Tech","My Company","Helpers","CTO2","3","2"`);
            expect(exported.split(`\n`)[4]).toBe(`"1","Marketing","My Company","Authority","CMO","3","2"`);
            expect(exported.split(`\n`)[5]).toBe(`"1","Marketing","My Company","Helpers","CMO1","3","2"`);
            expect(exported.split(`\n`)[6]).toBe(`"1","Marketing","My Company","Helpers","CMO2","3","2"`);
        });
    }))

});