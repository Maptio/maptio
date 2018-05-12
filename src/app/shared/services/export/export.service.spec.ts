import { BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Http } from '@angular/http';
import { inject, TestBed } from '@angular/core/testing';
import { D3Service } from 'd3-ng2-service';
import { DataSet } from '../../model/dataset.data';
import { Initiative } from '../../model/initiative.data';
import { Team } from '../../model/team.data';
import { ExportService } from './export.service';

describe("export.service.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ExportService, D3Service,
                {
                    provide: Http,
                    useFactory: (
                        mockBackend: MockBackend,
                        options: BaseRequestOptions
                    ) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
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
        let team = new Team({ settings: { authority: "dRiveR", helper: "backSeaT" } })
        let dataset = new DataSet({ datasetId: "ID", initiative: data, team: team });
        target.getReport(dataset).subscribe(exported => {
            expect(exported.split(`\n`).length).toBe(10);
            expect(exported.split(`\n`)[0]).toBe("Depth,Initiative,Parent Initiative,Type,Person,Participants,Helpers,Tags");
            expect(exported.split(`\n`)[1]).toBe(`"1","Tech","My Company","Driver","CTO","3","2","tag 1"`);
            expect(exported.split(`\n`)[2]).toBe(`"1","Tech","My Company","Backseat","CTO1","3","2","tag 1"`);
            expect(exported.split(`\n`)[3]).toBe(`"1","Tech","My Company","Backseat","CTO2","3","2","tag 1"`);
            expect(exported.split(`\n`)[4]).toBe(`"1","Marketing","My Company","Driver","CMO","3","2","tag 1/tag 2"`);
            expect(exported.split(`\n`)[5]).toBe(`"1","Marketing","My Company","Backseat","CMO1","3","2","tag 1/tag 2"`);
            expect(exported.split(`\n`)[6]).toBe(`"1","Marketing","My Company","Backseat","CMO2","3","2","tag 1/tag 2"`);
            expect(exported.split(`\n`)[7]).toBe(`"1","Finance","My Company","Driver","CFO","3","2",""`);
            expect(exported.split(`\n`)[8]).toBe(`"1","Finance","My Company","Backseat","CFO1","3","2",""`);
            expect(exported.split(`\n`)[9]).toBe(`"1","Finance","My Company","Backseat","CFO2","3","2",""`);
        });
    }))


});