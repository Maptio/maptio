import { MailingService } from "./mailing.service";
import { TestBed, inject, fakeAsync } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, HttpModule, Response, BaseRequestOptions, ResponseOptions } from "@angular/http";
import * as aws from "aws-sdk";

describe("mailing.service.ts", () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                MailingService
            ]
        });

    });


    it("should work", () => {
        expect(true).toBe(true);
    })
});



