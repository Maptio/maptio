import { Http, BaseRequestOptions, RequestMethod, ResponseOptions, Response } from "@angular/http";
import { TestBed, inject, async } from "@angular/core/testing";
import { JwtEncoder } from "./jwt.service";
import { MockBackend, MockConnection } from "@angular/http/testing";

describe("jwt.service.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                JwtEncoder,
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
    })

    it("encodes", async(inject([JwtEncoder, Http, MockBackend], (target: JwtEncoder, http: Http, mockBackend: MockBackend) => {
        const mockResponse = { token: "abcdefghijklmn" };

        mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.method === RequestMethod.Post && connection.request.url === "/api/v1/jwt/encode") {
                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(mockResponse)
                })));
            }
            else {
                throw new Error("URL " + connection.request.url + " is not configured");
            }
        });

        let payload = { data: "some randow data" }

        target.encode(payload).then((token) => {
            expect(token).toBe("abcdefghijklmn")
        })
    })))

    it("decodes", async(inject([JwtEncoder, Http, MockBackend], (target: JwtEncoder, http: Http, mockBackend: MockBackend) => {
        const mockResponse = { data: "some randow data" };

        mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.method === RequestMethod.Get && connection.request.url === "/api/v1/jwt/decode/" + "abcdefghijklmn") {
                connection.mockRespond(new Response(new ResponseOptions({
                    body: JSON.stringify(mockResponse)
                })));
            }
            else {
                throw new Error("URL " + connection.request.url + " is not configured");
            }
        });

        target.decode("abcdefghijklmn").then((payload) => {
            expect(payload.data).toBe("some randow data")
        })
    })))


});