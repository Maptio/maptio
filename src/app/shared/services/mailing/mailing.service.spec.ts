import { AuthHttp } from "angular2-jwt";
import { MailingService } from "./mailing.service";
import { TestBed, inject, fakeAsync } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, HttpModule, Response, BaseRequestOptions, ResponseOptions, RequestMethod } from "@angular/http";
import * as aws from "aws-sdk";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";

describe("mailing.service.ts", () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                MailingService,
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
                },
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions
            ]
        });

    });

    it("should send invitation", inject([MailingService, Http, AuthHttp, MockBackend], (target: MailingService, http: Http, authHttp: AuthHttp, mockBackend: MockBackend) => {

        const mockResponse = { MessageId: "MSG_ID" };
        let from = "me@maptio.com";
        let to = ["someone@compant.com"]
        let url = "http://visit/me"
        let teamName = "Your team"
        let invitedBy = "Me agains"

        mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.method === RequestMethod.Post && connection.request.url === "/api/v1/mail/invite"
                && connection.request.json().from === from
                && connection.request.json().to === to
                && connection.request.json().url === url
                && connection.request.json().team === teamName
                && connection.request.json().subject === `${invitedBy} invited to join team "${teamName}" on Maptio`
            ) {
                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(mockResponse)
                })));
            }
            else {
                throw new Error("URL " + connection.request.url + " is not configured");
            }
        });

        target.sendInvitation(from, to, url, teamName, invitedBy)
            .then((result) => {
                expect(result).toBe(true)
            });




    }))

    it("should send confirmation", inject([MailingService, Http, AuthHttp, MockBackend], (target: MailingService, http: Http, authHttp: AuthHttp, mockBackend: MockBackend) => {

        const mockResponse = { MessageId: "MSG_ID" };
        let from = "me@maptio.com";
        let to = ["someone@compant.com"]
        let url = "http://visit/me"

        mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.method === RequestMethod.Post && connection.request.url === "/api/v1/mail/confirm"
                && connection.request.json().from === from
                && connection.request.json().to === to
                && connection.request.json().url === url
                && connection.request.json().subject === `Maptio Account Confirmation`
            ) {
                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(mockResponse)
                })));
            }
            else {
                throw new Error("URL " + connection.request.url + " is not configured");
            }
        });

        target.sendConfirmation(from, to, url)
            .then((result) => {
                expect(result).toBe(true)
            });
    }))
});



