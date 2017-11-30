import { Observable } from "rxjs/Rx";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import { environment } from "./../../../../environment/environment";
import { encodeTestToken } from "angular2-jwt/angular2-jwt-test-helpers";
import { DatasetFactory } from "./../dataset.factory";
import { AuthHttp } from "angular2-jwt";
import { LoaderService } from "./../loading/loader.service";
import { RouterTestingModule } from "@angular/router/testing";
import { MailingService } from "./../mailing/mailing.service";
import { JwtEncoder } from "./../encoding/jwt.service";
import { Router, NavigationStart } from "@angular/router";
import { User } from "../../model/user.data";
import { ErrorService } from "../error/error.service";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Http, BaseRequestOptions, RequestMethod, Response, ResponseOptions } from "@angular/http";
import { UserFactory } from "../user.factory";
import { Auth } from "./auth.service"
import { TestBed, inject, fakeAsync } from "@angular/core/testing";
import { AuthConfiguration } from "./auth.config";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";


describe("auth.service.ts", () => {

    const expiredToken = encodeTestToken({
        "exp": 0
    });
    const validToken = encodeTestToken({
        "exp": 9999999999
    });
    // const noExpiryToken = encodeTestToken({
    //     "sub": "1234567890",
    //     "name": "John Doe",
    //     "admin": true
    // });


    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AuthConfiguration, useClass: class {
                        getWebAuth() { return }
                        getAccessToken() { return; }
                    }
                },
                Auth, UserFactory, DatasetFactory, JwtEncoder, MailingService, LoaderService,
                {
                    provide: Router, useClass: class {
                        navigate = jasmine.createSpy("navigate");
                        navigateByUrl = jasmine.createSpy("navigateByUrl");
                        events = Observable.of(new NavigationStart(0, "/next"))
                    }
                },
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService,
                Angulartics2Mixpanel, Angulartics2
            ],
            imports: [RouterTestingModule]
        });

        localStorage.clear();
    });

    describe("logout", () => {

        it("should redirect to /logout", inject([Auth, Router], (auth: Auth, router: Router) => {
            // spyOn(auth, "shutDownIntercom");
            auth.logout();
            expect(router.navigateByUrl).toHaveBeenCalledWith("/logout");
            // expect(auth.shutDownIntercom).toHaveBeenCalled();
        }));
    });

    describe("authenticationProviderAuthenticated", () => {
        it("should return false when token is expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.returnValue(expiredToken)
            expect(auth.authenticationProviderAuthenticated()).toBe(false);
            expect(localStorage.getItem).toHaveBeenCalledWith("access_token")
        }))

        it("should return true when token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.returnValue(validToken)
            expect(auth.authenticationProviderAuthenticated()).toBe(true);
            expect(localStorage.getItem).toHaveBeenCalledWith("access_token")
        }))
    });

    describe("internalApiAuthenticated", () => {
        it("should return false when token is expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.returnValue(expiredToken)
            expect(auth.internalApiAuthenticated()).toBe(false);
            expect(localStorage.getItem).toHaveBeenCalledWith("maptio_api_token")
        }))

        it("should return true when token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.returnValue(validToken)
            expect(auth.internalApiAuthenticated()).toBe(true);
            expect(localStorage.getItem).toHaveBeenCalledWith("maptio_api_token")
        }))
    });

    describe("authenticated", () => {
        it("should return false when token is expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.returnValue(expiredToken)
            expect(auth.authenticated()).toBe(false);
            expect(localStorage.getItem).toHaveBeenCalledWith("id_token")
        }))

        it("should return true when token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.returnValue(validToken)
            expect(auth.authenticated()).toBe(true);
            expect(localStorage.getItem).toHaveBeenCalledWith("id_token")
        }))
    });

    describe("allAuthenticated", () => {
        it("should return true when all tokens are valid", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.returnValue(validToken)
            expect(auth.allAuthenticated()).toBe(true);
            expect(localStorage.getItem).toHaveBeenCalledTimes(3)
        }))

        it("should return false when id_token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.callFake((tokenName: string) => {
                if (tokenName === "id_token") {
                    return expiredToken
                }
                return validToken
            })
            expect(auth.allAuthenticated()).toBe(false);
        }))

        it("should return false when maptio_api_token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.callFake((tokenName: string) => {
                if (tokenName === "maptio_api_token") {
                    return expiredToken
                }
                return validToken
            })
            expect(auth.allAuthenticated()).toBe(false);
        }))

        it("should return false when access_token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "getItem").and.callFake((tokenName: string) => {
                if (tokenName === "access_token") {
                    return expiredToken
                }
                return validToken
            })
            expect(auth.allAuthenticated()).toBe(false);
        }))
    });

    describe("loginMaptioApi", () => {
        it("should call correct dependencies when email and password are provided", inject([Auth, AuthConfiguration], (target: Auth, configuration: AuthConfiguration) => {
            let client = jasmine.createSpyObj("client", ["login"])
            spyOn(configuration, "getWebAuth").and.returnValue({ client: client })

            target.loginMaptioApi("iam@company.com", "secret")
            expect(client.login).toHaveBeenCalledWith({
                realm: environment.CONNECTION_NAME,
                username: "iam@company.com",
                password: "secret",
                scope: "openid profile api invite",
                audience: environment.MAPTIO_API_URL
            }, jasmine.any(Function))
        }));

        it("should do nothing if email and password are not provided", inject([Auth, AuthConfiguration], (target: Auth, configuration: AuthConfiguration) => {
            let client = jasmine.createSpyObj("client", ["login"])
            spyOn(configuration, "getWebAuth").and.returnValue({ client: client })

            target.loginMaptioApi("", "")
            expect(client.login).not.toHaveBeenCalled()
        }));
    });

    describe("getUserInfo", () => {
        it("should return user info", fakeAsync(inject([Auth, Http, AuthConfiguration, MockBackend], (target: Auth, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend) => {

            const mockResponse = { user_id: "FOUND_ID" };

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

            target.getUserInfo("ID")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result instanceof User).toBe(true)
                    expect(result.user_id).toBe("FOUND_ID")
                });
        })));
    });

    describe("getUser", () => {
        it("should make calls to build user when profile is in localStorage and return user", fakeAsync(inject([Auth, Http, AuthConfiguration, MockBackend, UserFactory, DatasetFactory], (target: Auth, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend, userFactory: UserFactory, datasetFactory: DatasetFactory) => {
            spyOn(localStorage, "getItem").and.returnValue(`{ "user_id": "ID" }`);
            let spyGetUserInfo = spyOn(target, "getUserInfo").and.returnValue(Promise.resolve(new User({ user_id: "ID", name: "Jane Doe" })))
            let spyGetUserDb = spyOn(userFactory, "get").and.returnValue(Promise.resolve(new User({ user_id: "ID", name: "Jane Doe", teams: ["t1", "t2", "t3"], shortid: "short" })))
            let spyGetDatasets = spyOn(datasetFactory, "get").and.returnValue(Promise.resolve(["d1", "d2", "d3"]))
            target.getUser().subscribe(user => {
                expect(user.user_id).toBe("ID");
                expect(user.name).toBe("Jane Doe");
                expect(user.teams).toEqual(["t1", "t2", "t3"]);
                expect(user.shortid).toBe("short");
                expect(user.datasets).toEqual(["d1", "d2", "d3"])

                expect(spyGetUserInfo).toHaveBeenCalledWith("ID");
                expect(spyGetUserDb).toHaveBeenCalledWith("ID")
                expect(spyGetDatasets).toHaveBeenCalledWith(jasmine.objectContaining({ user_id: "ID", name: "Jane Doe", teams: ["t1", "t2", "t3"], shortid: "short" }))
            })
        })));

        it("should do nothing when profile is in localStorage and return undefined", fakeAsync(inject([Auth, Http, AuthConfiguration, MockBackend, UserFactory, DatasetFactory], (target: Auth, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend, userFactory: UserFactory, datasetFactory: DatasetFactory) => {
            spyOn(localStorage, "getItem").and.returnValue(undefined);
            spyOn(target, "getUserInfo").and.returnValue(Promise.resolve(new User({ user_id: "ID", name: "Jane Doe" })))
            spyOn(userFactory, "get").and.returnValue(Promise.resolve(new User({ user_id: "ID", name: "Jane Doe", teams: ["t1", "t2", "t3"], shortid: "short" })))
            spyOn(datasetFactory, "get").and.returnValue(Promise.resolve(["d1", "d2", "d3"]))
            target.getUser().subscribe(user => {
                expect(user).toBeUndefined()
            })
        })));


    });

});