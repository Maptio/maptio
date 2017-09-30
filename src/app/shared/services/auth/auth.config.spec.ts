import { environment } from "./../../../../environment/environment";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, BaseRequestOptions, RequestMethod, Response, ResponseOptions } from "@angular/http";
import { TestBed, inject } from "@angular/core/testing";
import { AuthConfiguration } from "./auth.config";
import { WebAuth } from "auth0-js";


describe("auth.config.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthConfiguration,
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

    it("should have correct keys and tokens", inject([AuthConfiguration, Http, MockBackend], (target: AuthConfiguration, http: Http, mockBackend: MockBackend) => {
        expect(target.AUTH0_APP_KEY).toBe(environment.AUTH0_APP_KEY);
        expect(target.AUTH0_DOMAIN).toBe(environment.AUTH0_DOMAIN);
        expect(target.AUTH0_MANAGEMENTAPI_KEY).toBe(environment.AUTH0_MANAGEMENTAPI_KEY);
        expect(target.AUTH0_MANAGEMENTAPI_SECRET).toBe(environment.AUTH0_MANAGEMENTAPI_SECRET);
    }));

    it("should retrieve access token when it is not in localStorage", inject([AuthConfiguration, Http, MockBackend], (target: AuthConfiguration, http: Http, mockBackend: MockBackend) => {
        mockBackend.connections.subscribe((connection: MockConnection) => {
            if (connection.request.method === RequestMethod.Post
                && connection.request.url === environment.ACCESS_TOKEN_URL
                && connection.request.json().client_id === environment.AUTH0_MANAGEMENTAPI_KEY
                && connection.request.json().client_secret === environment.AUTH0_MANAGEMENTAPI_SECRET
                && connection.request.json().audience === environment.ACCESS_TOKEN_AUDIENCE
                && connection.request.json().grant_type === "client_credentials"
            ) {
                connection.mockRespond(new Response(new ResponseOptions({
                    body: { access_token: "token" }
                })));
            }
            else {
                throw new Error("URL " + connection.request.url + " is not configured");
            }
        });


        spyOn(localStorage, "getItem").and.returnValue(undefined)

        target.getAccessToken().then((token) => {
            expect(token).toBe("token");
            expect(localStorage.getItem).toHaveBeenCalledWith("access_token")
        })
    }));

    it("should get access token when it is in localStorage", inject([AuthConfiguration, Http, MockBackend], (target: AuthConfiguration, http: Http, mockBackend: MockBackend) => {

        spyOn(localStorage, "getItem").and.returnValue("token")
        spyOn(http, "post");
        target.getAccessToken().then((token) => {
            expect(http.post).not.toHaveBeenCalled();
            expect(token).toBe("token");
            expect(localStorage.getItem).toHaveBeenCalledWith("access_token")
        })
    }));
});