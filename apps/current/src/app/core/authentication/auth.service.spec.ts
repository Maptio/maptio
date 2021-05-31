
import {of as observableOf,  Observable } from 'rxjs';
import { encodeTestToken } from "angular2-jwt/angular2-jwt-test-helpers";
import { TestBed, inject, async } from "@angular/core/testing";
import { AuthConfiguration } from "./auth.config";
import { Auth } from "./auth.service";
import { UserFactory } from "../http/user/user.factory";
import { DatasetFactory } from "../http/map/dataset.factory";
import { NgProgress, NgProgressModule } from "@ngx-progressbar/core";
import { UserRoleService } from "../../shared/model/permission.data";
import { Router, NavigationStart } from "@angular/router";
import { Http, Response, BaseRequestOptions, RequestMethod, ResponseOptions } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { AuthHttp } from "angular2-jwt";
import { authHttpServiceFactoryTesting } from "../mocks/authhttp.helper.shared";
import { ErrorService } from "../../shared/services/error/error.service";
import { RouterTestingModule } from "@angular/router/testing";
import { environment } from "../../config/environment";
import { User } from "../../shared/model/user.data";
import { AnalyticsModule } from "../analytics.module";
import { CoreModule } from "../core.module";
import { SharedModule } from "../../shared/shared.module";

describe("auth.service.ts", () => {

    const expiredToken = encodeTestToken({
        "exp": 0
    });
    const validToken = encodeTestToken({
        "exp": 9999999999
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AuthConfiguration, useClass: class {
                        getWebAuth() { return }
                        getAccessToken() { return; }
                    }
                },
                Auth,
                {
                    provide: Router, useClass: class {
                        navigate = jest.fn();
                        navigateByUrl = jest.fn();
                        events = observableOf(new NavigationStart(0, "/next"))
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
                ErrorService
            ],
            imports: [RouterTestingModule, NgProgressModule, AnalyticsModule, CoreModule, SharedModule.forRoot()]
        });

        localStorage.clear();
    });

    describe("logout", () => {

        it("should redirect to /logout", inject([Auth, Router], (auth: Auth, router: Router) => {
            auth.logout();
            expect(router.navigateByUrl).toHaveBeenCalledWith("/logout");
        }));
    });

    describe("authenticationProviderAuthenticated", () => {
        it("should return false when token is expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("access_token", JSON.stringify(expiredToken));
            expect(auth.authenticationProviderAuthenticated()).toBe(false);
        }))

        it("should return true when token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("access_token", JSON.stringify(validToken));
            expect(auth.authenticationProviderAuthenticated()).toBe(true);
        }))
    });

    describe("internalApiAuthenticated", () => {
        it("should return false when token is expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("maptio_api_token", JSON.stringify(expiredToken));
            expect(auth.authenticationProviderAuthenticated()).toBe(false);
        }))

        it("should return true when token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("maptio_api_token", JSON.stringify(validToken));
            expect(auth.authenticationProviderAuthenticated()).toBe(false);
        }))
    });

    describe("authenticated", () => {
        it("should return false when token is expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("id_token", JSON.stringify(expiredToken));
            expect(auth.authenticationProviderAuthenticated()).toBe(false);
        }))

        it("should return true when token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("id_token", JSON.stringify(validToken));
            expect(auth.authenticationProviderAuthenticated()).toBe(false);
        }))
    });

    describe("allAuthenticated", () => {
        it("should return true when all tokens are valid", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("maptio_api_token", JSON.stringify(validToken));
            window.localStorage.setItem("id_token", JSON.stringify(validToken));
            window.localStorage.setItem("access_token", JSON.stringify(validToken));

            expect(auth.allAuthenticated()).toBe(true);
        }))

        it("should return false when id_token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("maptio_api_token", JSON.stringify(validToken));
            window.localStorage.setItem("id_token", JSON.stringify(expiredToken));
            window.localStorage.setItem("access_token", JSON.stringify(validToken));

            expect(auth.allAuthenticated()).toBe(false);
        }))

        it("should return false when maptio_api_token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("maptio_api_token", JSON.stringify(expiredToken));
            window.localStorage.setItem("id_token", JSON.stringify(validToken));
            window.localStorage.setItem("access_token", JSON.stringify(validToken));

             expect(auth.allAuthenticated()).toBe(false);
        }))

        it("should return false when access_token is not expired", inject([Auth, Router], (auth: Auth, router: Router) => {
            window.localStorage.clear();
            window.localStorage.setItem("maptio_api_token", JSON.stringify(validToken));
            window.localStorage.setItem("id_token", JSON.stringify(validToken));
            window.localStorage.setItem("access_token", JSON.stringify(expiredToken));

            expect(auth.allAuthenticated()).toBe(false);
        }))
    });

    describe("loginMaptioApi", () => {
        it("should call correct dependencies when email and password are provided", inject([Auth, AuthConfiguration], (target: Auth, configuration: AuthConfiguration) => {
            let client = {
                login : jest.fn()
            }
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
            let client = {
                login : jest.fn()
            }
            spyOn(configuration, "getWebAuth").and.returnValue({ client: client })

            target.loginMaptioApi("", "")
            expect(client.login).not.toHaveBeenCalled()
        }));
    });

    describe("getUserInfo", () => {
        it("should return user info", async(inject([Auth, AuthConfiguration, MockBackend], (target: Auth, configuration: AuthConfiguration, mockBackend: MockBackend) => {
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

            let spyAccessToken = jest.spyOn(configuration, "getAccessToken").mockReturnValue(Promise.resolve("token"));

            target.getUserInfo("ID")
                .then((result) => {
                    expect(spyAccessToken).toHaveBeenCalled();
                    expect(result instanceof User).toBe(true)
                    expect(result.user_id).toBe("FOUND_ID")
                });
        })));
    });

    describe("getUser", () => {
        it("should make calls to build user when profile is in localStorage and return user", async(inject([Auth, Http, AuthConfiguration, MockBackend, UserFactory, DatasetFactory, UserRoleService], (target: Auth, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend, userFactory: UserFactory, datasetFactory: DatasetFactory, permissionsService: UserRoleService) => {
            spyOn(localStorage, "getItem").and.returnValue(`{ "user_id": "ID" }`);
            let spyGetUserInfo = spyOn(target, "getUserInfo").and.returnValue(Promise.resolve(new User({ user_id: "ID", name: "Jane Doe" })))
            let spyGetUserDb = spyOn(userFactory, "get").and.returnValue(Promise.resolve(new User({ user_id: "ID", name: "Jane Doe", teams: ["t1", "t2", "t3"], shortid: "short" })))
            let spyGetDatasets = spyOn(datasetFactory, "get").and.returnValue(Promise.resolve(["d1", "d2", "d3"]))
            let spyGetPermissions = spyOn(permissionsService, "get").and.returnValue([])
            target.getUser().subscribe(user => {
                expect(user.user_id).toBe("ID");
                expect(user.name).toBe("Jane Doe");
                expect(user.teams).toEqual(["t1", "t2", "t3"]);
                expect(user.shortid).toBe("short");
                expect(user.datasets).toEqual(["d1", "d2", "d3"])

                expect(spyGetUserInfo).toHaveBeenCalledWith("ID");
                expect(spyGetUserDb).toHaveBeenCalledWith("ID")
                expect(spyGetDatasets).toHaveBeenCalledWith(jasmine.objectContaining({ user_id: "ID", name: "Jane Doe", teams: ["t1", "t2", "t3"], shortid: "short" }))
                expect(spyGetPermissions).toHaveBeenCalled();
            })
        })));

        it("should do nothing when profile is in localStorage and return undefined", async(inject([Auth, Http, AuthConfiguration, MockBackend, UserFactory, DatasetFactory], (target: Auth, http: Http, configuration: AuthConfiguration, mockBackend: MockBackend, userFactory: UserFactory, datasetFactory: DatasetFactory) => {
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