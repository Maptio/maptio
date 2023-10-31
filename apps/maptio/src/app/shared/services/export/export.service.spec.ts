import { SlackIntegration } from './../../model/integrations.data';
import { Initiative } from './../../model/initiative.data';
import { Observable } from 'rxjs';
import { AuthHttp } from 'angular2-jwt';
import { BaseRequestOptions, Response } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { Http, RequestMethod, Headers, Request } from '@angular/http';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { DataSet } from '../../model/dataset.data';
import { Team } from '../../model/team.data';
import { ExportService } from './export.service';
import { authHttpServiceFactoryTesting } from '../../../core/mocks/authhttp.helper.shared';
const fixtures = require('./fixtures/data.json');

describe('export.service.ts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExportService,
        {
          provide: AuthHttp,
          useFactory: authHttpServiceFactoryTesting,
          deps: [Http, BaseRequestOptions],
        },
        {
          provide: Http,
          useFactory: (
            mockBackend: MockBackend,
            options: BaseRequestOptions
          ) => {
            return new Http(mockBackend, options);
          },
          deps: [MockBackend, BaseRequestOptions],
        },
        MockBackend,
        BaseRequestOptions,
      ],
    });
  });

  // beforeAll(() => {
  //     fixture.setBase("src/app/shared/services/export/fixtures");
  // });

  // afterEach(() => {
  //     fixture.cleanup();
  // });

  describe('getReport', () => {
    it('exports', inject([ExportService], (target: ExportService) => {
      const data = new Initiative().deserialize(fixtures);
      const team = new Team({
        settings: { authority: 'dRiveR', helper: 'backSeaT' },
      });
      const dataset = new DataSet({
        datasetId: 'ID',
        initiative: data,
        team: team,
      });
      target.getReport(dataset).subscribe((exported) => {
        expect(exported.split(`\n`).length).toBe(10);
        expect(exported.split(`\n`)[0]).toBe(
          'Depth,Circle,Parent Circle,Type,Person,Participants,Helpers,Tags'
        );
        expect(exported.split(`\n`)[1]).toBe(
          `"1","Tech","My Company","Driver","CTO","3","2","tag 1"`
        );
        expect(exported.split(`\n`)[2]).toBe(
          `"1","Tech","My Company","Backseat","CTO1","3","2","tag 1"`
        );
        expect(exported.split(`\n`)[3]).toBe(
          `"1","Tech","My Company","Backseat","CTO2","3","2","tag 1"`
        );
        expect(exported.split(`\n`)[4]).toBe(
          `"1","Marketing","My Company","Driver","CMO","3","2","tag 1/tag 2"`
        );
        expect(exported.split(`\n`)[5]).toBe(
          `"1","Marketing","My Company","Backseat","CMO1","3","2","tag 1/tag 2"`
        );
        expect(exported.split(`\n`)[6]).toBe(
          `"1","Marketing","My Company","Backseat","CMO2","3","2","tag 1/tag 2"`
        );
        expect(exported.split(`\n`)[7]).toBe(
          `"1","Finance","My Company","Driver","CFO","3","2",""`
        );
        expect(exported.split(`\n`)[8]).toBe(
          `"1","Finance","My Company","Backseat","CFO1","3","2",""`
        );
        expect(exported.split(`\n`)[9]).toBe(
          `"1","Finance","My Company","Backseat","CFO2","3","2",""`
        );
      });
    }));
  });

  // describe("sending slack notifications", () => {

  //     it("should retrieve snapshot and post to slack api",
  //         async(inject([ExportService, D3Service, AuthHttp], (target: ExportService, d3Service: D3Service, http: AuthHttp) => {
  //             let spySnapshot = spyOn(target, "getSnapshot").and.returnValue(Observable.of("http://image"));
  //             let spyHttp = spyOn(http, "request");
  //             target.sendSlackNotification(
  //                 "<svg></svg>",
  //                 "datasetId",
  //                 new Initiative({ name: "some name" }),
  //                 new SlackIntegration({
  //                     access_token: "token";
  //                     team_name: "greatest team";
  //                     team_id: "team slack id";
  //                     incoming_webhook: {
  //                         url: "http://webhook",
  //                         channel: "channel",
  //                         channel_id: "channelID",
  //                         configuration_url: "http://configuration"
  //                     }
  //                 }),
  //                 "this is my new post");

  //             expect(spySnapshot).toHaveBeenCalledWith("<svg></svg>", "datasetId")
  //             spySnapshot.calls.mostRecent().returnValue.map(url => {
  //                 expect(url).toBe("http://image")
  //             })
  //             .subscribe(res => {
  //                 expect(spyHttp).toHaveBeenCalled()

  //             })
  //         })
  //         ));
  // });
});
