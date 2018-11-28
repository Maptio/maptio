import { AuthConfiguration } from "./../auth/auth.config";
import { environment } from "./../../../../environment/environment";
import { MailingService } from "./../mailing/mailing.service";
import { JwtEncoder } from "./../encoding/jwt.service";
import { AuthHttp } from "angular2-jwt";
import { UserService } from "./user.service";
import { TestBed, inject, fakeAsync } from "@angular/core/testing";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, HttpModule, Response, BaseRequestOptions, ResponseOptions, RequestMethod } from "@angular/http";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";
import { User } from "../../model/user.data";
import { UserFactory } from "../user.factory";

describe("user.service.ts", () => {

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                UserService, JwtEncoder, MailingService, AuthConfiguration,UserFactory,
                // {
                //     AuthConfiguration, useClass: class { getAccessToken = jasmine.createSpy("getAccessToken"); }
                // },
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

    describe("isUserExist", () => {
        it("should return true when ther is only one user matching the email", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = { users: ["some"], total: 1 };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?include_totals=true&search_engine=v3&q=email%3A%22ido%40exist.com%22`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isUserExist("ido@exist.com")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))

        it("should return false when ther is more than user matching the email", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = { users: ["one", "two", "three"], total: 3 };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?include_totals=true&search_engine=v3&q=email%3A%22ido%40exist.com%22`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isUserExist("ido@exist.com")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(false)
                });
        })))

        it("should return false when there is no user matching the email", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = { total: 0 };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?include_totals=true&search_engine=v3&q=email%3A%22ido%40exist.com%22`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isUserExist("ido@exist.com")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(false)
                });
        })))
    })

    describe("changePassword", () => {
        it("should call right dependencies", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {
            let webAuth = jasmine.createSpyObj("webAuth", ["changePassword"])
            spyOn(configuration, "getWebAuth").and.returnValue(webAuth);
            target.changePassword("someone@company.com")
            expect(webAuth.changePassword).toHaveBeenCalledWith({ connection: environment.CONNECTION_NAME, email: "someone@company.com" }, jasmine.any(Function));
        })));
    });

    describe("updateInvitiationSentStatus", () => {
        it("should call right dependencies when invitation is sent", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Patch
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                    && connection.request.json().app_metadata.invitation_sent === true
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify({})
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.updateInvitiationSentStatus("ID", true)
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))

        it("should call right dependencies when invitation is not sent", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Patch
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                    && connection.request.json().app_metadata.invitation_sent === false
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify({})
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.updateInvitiationSentStatus("ID", false)
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))

    })

    describe("updateActivationPendingStatus", () => {
        it("should call right dependencies when activation is pending", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Patch
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                    && connection.request.json().app_metadata.activation_pending === true
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify({})
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.updateActivationPendingStatus("ID", true)
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))

        it("should call right dependencies when activation is not pending", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Patch
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                    && connection.request.json().app_metadata.activation_pending === false
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify({})
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.updateActivationPendingStatus("ID", false)
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))

    })

    describe("updateUserInformation", () => {
        it("should call right dependencies ", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Patch
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                    && connection.request.json().password === "secret"
                    && connection.request.json().user_metadata.given_name === "I"
                    && connection.request.json().user_metadata.family_name === "D"
                    && connection.request.json().connection === environment.CONNECTION_NAME
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify({})
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.updateUserCredentials("ID", "secret", "I", "D")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))


    })

    describe("isInvitationSent", () => {
        it("should return true when invititaion is sent", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = { app_metadata: { invitation_sent: true } };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isInvitationSent("ID")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))

        it("should return false when invititaion is false", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = { app_metadata: { invitation_sent: false } };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isInvitationSent("ID")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(false)
                });
        })))

        it("should return false when app_metadata is missing", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = {};

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isInvitationSent("ID")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(false)
                });
        })))

    })

    describe("isActivationPendingByEmail", () => {

        it("should return true when there is only one user matching the email and their activation is pending", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = {
                users: [{
                    user_id: "ID",
                    app_metadata: { activation_pending: true }
                }],
                total: 1
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?include_totals=true&search_engine=v3&q=email%3A%22ido%40exist.com%22`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: mockResponse
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isActivationPendingByEmail("ido@exist.com")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result.isActivationPending).toBe(true)
                    expect(result.user_id).toBe("ID")
                });
        })))

        it("should return false when there is only one user matching the email and their activation not is pending", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = {
                users: [{
                    user_id: "ID",
                    app_metadata: { activation_pending: false }
                }], total: 1
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?include_totals=true&search_engine=v3&q=email%3A%22ido%40exist.com%22`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: mockResponse
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isActivationPendingByEmail("ido@exist.com")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result.isActivationPending).toBe(false)
                    expect(result.user_id).toBe("ID")
                });
        })))

        it("should return false when there is only one user matching the email and their app_metadata is missing", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = {
                users: [{
                    user_id: "ID"
                }], total: 1
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?include_totals=true&search_engine=v3&q=email%3A%22ido%40exist.com%22`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: mockResponse
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isActivationPendingByEmail("ido@exist.com")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result.isActivationPending).toBe(false)
                    expect(result.user_id).toBe("ID")
                });
        })))

        it("should return false when there is no one matching the email ", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = {
                total: 0
            };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?include_totals=true&search_engine=v3&q=email%3A%22ido%40exist.com%22`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: mockResponse
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isActivationPendingByEmail("ido@exist.com")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result.isActivationPending).toBe(false)
                    expect(result.user_id).toBeUndefined()
                });
        })))

    })

    describe("isActivationPendingByUserId", () => {
        it("should return true when activation is pending", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = { app_metadata: { activation_pending: true } };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: mockResponse
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isActivationPendingByUserId("ID")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))

        it("should return false when activation is not pending", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = { app_metadata: { activation_pending: false } };

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: mockResponse
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isActivationPendingByUserId("ID")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(false)
                });
        })))

        it("should return false when app_metadata is missing", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = {};

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: mockResponse
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.isActivationPendingByUserId("ID")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(false)
                });
        })))

    })

    describe("createUser", () => {
        it("should call right dependencies when it is a sign up", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Post
                    && connection.request.url === `${environment.USERS_API_URL}`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                    && connection.request.json().connection === environment.CONNECTION_NAME
                    && connection.request.json().email === "someone@company.com"
                    && connection.request.json().name === "I Am"
                    && connection.request.json().password.length === 73
                    && connection.request.json().email_verified === true
                    && connection.request.json().verify_email === false
                    && connection.request.json().app_metadata.activation_pending === true
                    && connection.request.json().app_metadata.invitation_sent === false
                    && connection.request.json().user_metadata.given_name === "I"
                    && connection.request.json().user_metadata.family_name === "Am"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify({})
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.createUser("someone@company.com", "I", "Am", true)
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                });
        })))

    })

    describe("generateUserToken", () => {
        it("should call right dependencies", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend, JwtEncoder], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend, encoding: JwtEncoder) => {
            let spyEncoding = spyOn(encoding, "encode").and.returnValue(Promise.resolve("token"))
            target.generateUserToken("ID", "someone@company.com", "I", "Am").then((token) => {
                expect(token).toBe("token")
                expect(spyEncoding).toHaveBeenCalledWith({ user_id: "ID", email: "someone@company.com", firstname: "I", lastname: "Am" })
            })
        })))
    })

    describe("sendConfirmation", () => {
        it("should call the right dependencies", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend, JwtEncoder, MailingService], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend, encoding: JwtEncoder, mailing: MailingService) => {
            let spyEncoding = spyOn(encoding, "encode").and.returnValue(Promise.resolve("userToken"))
            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("accessToken"))
            let spyMailing = spyOn(mailing, "sendConfirmation")
            let spyUpdateStatus = spyOn(target, "updateActivationPendingStatus")

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Post
                    && connection.request.url === `${environment.TICKETS_API_URL}`
                    && connection.request.headers.get("Authorization") === "Bearer accessToken"
                    && connection.request.json().user_id === "ID"
                    && connection.request.json().result_url === "http://app.maptio.com/login?token=userToken"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: {
                            ticket: "http://ticket.com/url"
                        }
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });



            target.sendConfirmation("someone@company.com", "ID", "I", "Am", "I Am")
                .then(() => {

                })
                .then(() => {
                    Promise.all([spyEncoding.calls.mostRecent().returnValue, spyAccessToken.calls.mostRecent().returnValue])
                        .then(([userToken, apiToken]: [string, string]) => {
                            expect(userToken).toBe("userToken");
                            expect(apiToken).toBe("accessToken");
                            return "http://ticket.com/url" // I dont know how to make mockConnection return it. Wonky test but good enough for now?
                        })
                        .then((ticket) => {
                            expect(spyMailing).toHaveBeenCalledWith("support@maptio.com", ["someone@company.com"], "http://ticket.com/url")
                        })
                        .then(() => {
                            expect(spyUpdateStatus).toHaveBeenCalledWith("ID", true)
                        })

                })

        })))
    })

    describe("sendInvitation", () => {
        it("should call the right dependencies", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend, JwtEncoder, MailingService], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend, encoding: JwtEncoder, mailing: MailingService) => {
            let spyEncoding = spyOn(encoding, "encode").and.returnValue(Promise.resolve("userToken"))
            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("accessToken"))
            let spyMailing = spyOn(mailing, "sendInvitation")
            let spyUpdateStatus = spyOn(target, "updateInvitiationSentStatus")

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Post
                    && connection.request.url === `${environment.TICKETS_API_URL}`
                    && connection.request.headers.get("Authorization") === "Bearer accessToken"
                    && connection.request.json().user_id === "ID"
                    && connection.request.json().result_url === "http://app.maptio.com/login?token=userToken"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: {
                            ticket: "http://ticket.com/url"
                        }
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });



            target.sendInvite("someone@company.com", "ID", "I", "Am", "I Am", "Your team", "Me")
                .then(() => {

                })
                .then(() => {
                    Promise.all([spyEncoding.calls.mostRecent().returnValue, spyAccessToken.calls.mostRecent().returnValue])
                        .then(([userToken, apiToken]: [string, string]) => {
                            expect(userToken).toBe("userToken");
                            expect(apiToken).toBe("accessToken");
                            return "http://ticket.com/url" // I dont know how to make mockConnection return it. Wonky test but good enough for now?
                        })
                        .then((ticket) => {
                            expect(spyMailing).toHaveBeenCalledWith("support@maptio.com", ["someone@company.com"], "http://ticket.com/url", "Your team", "Me")
                        })
                        .then(() => {
                            expect(spyUpdateStatus).toHaveBeenCalledWith("ID", true)
                        })

                })

        })))
    })

    describe("getUsersInfo", () => {
        it("should not send request call when is empty array", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?per_page=100&q=`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: []
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.getUsersInfo([])
                .then((result) => {
                    // expect(result).toEqual([])
                    expect(spyAccessToken).not.toHaveBeenCalled();
                })
                .catch((reason) => {
                    expect(reason).toBe("You must specify some user ids.")
                })

        })));

        it("should send request call when non empty array - one request", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?q=${encodeURIComponent("user_id:\"1\" OR user_id:\"2\" OR user_id:\"3\"")}&search_engine=v3`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: [{ user_id: "1" }, { user_id: "2" }, { user_id: "3" }]
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.getUsersInfo([new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })])
                .then((result) => {
                    expect(result.length).toEqual(3);
                    result.forEach((r, i) => { expect(r.user_id).toBe(`${i + 1}`) })
                    expect(spyAccessToken).toHaveBeenCalled();
                })

        })));

        it("should send request call when non empty array and retrieve only found users", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Get
                    && connection.request.url === `${environment.USERS_API_URL}?q=${encodeURIComponent("user_id:\"1\" OR user_id:\"2\" OR user_id:\"3\"")}&search_engine=v3`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: [{ user_id: "1" }, { user_id: "2" }]
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.getUsersInfo([new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })])
                .then((result) => {
                    expect(result.length).toEqual(2);
                    result.forEach((r, i) => { expect(r.user_id).toBe(`${i + 1}`) })
                    expect(spyAccessToken).toHaveBeenCalled();
                })

        })));

    });

    describe("updateUserProfile", () => {
        it("should call right dependencies ", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Patch
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                    && connection.request.json().user_metadata.given_name === "John"
                    && connection.request.json().user_metadata.family_name === "Doe"
                    && connection.request.json().connection === environment.CONNECTION_NAME
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify({})
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.updateUserProfile("ID", "John", "Doe")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))
    });


    describe("updateUserPictureUrl", () => {
        it("should call right dependencies ", fakeAsync(inject([UserService, Http, AuthConfiguration, MockBackend], (target: UserService, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            mockBackend.connections.subscribe((connection: MockConnection) => {
                if (connection.request.method === RequestMethod.Patch
                    && connection.request.url === `${environment.USERS_API_URL}/ID`
                    && connection.request.headers.get("Authorization") === "Bearer token"
                    && connection.request.json().user_metadata.picture === "picture_url"
                    && connection.request.json().connection === environment.CONNECTION_NAME
                ) {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify({})
                    })));
                }
                else {
                    throw new Error("URL " + connection.request.url + " is not configured");
                }
            });

            let spyAccessToken = spyOn(configuration, "getAccessToken").and.returnValue(Promise.resolve("token"))

            target.updateUserPictureUrl("ID", "picture_url")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result).toBe(true)
                });
        })))
    });

});



