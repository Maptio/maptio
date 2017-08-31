import { MailingService, EmailService } from "./mailing.service";
import { TestBed, inject, fakeAsync } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, HttpModule, Response, BaseRequestOptions, ResponseOptions } from "@angular/http";
import * as nodemailer from "nodemailer";
import * as ses from "nodemailer-ses-transport";
import * as aws from "aws-sdk";

fdescribe("mailing.service.ts", () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                MailingService, EmailService
            ]
        });

    });


    it("should work", () => {
        expect(true).toBe(true);
    })
});



