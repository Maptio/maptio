import { encodeTestToken } from "angular2-jwt/angular2-jwt-test-helpers";
import { tokenNotExpired } from "angular2-jwt/angular2-jwt";
import { DatasetFactory } from "./../dataset.factory";
import { AuthHttp } from "angular2-jwt";
import { LoaderService } from "./../loading/loader.service";
import { RouterTestingModule } from "@angular/router/testing";
import { MailingService } from "./../mailing/mailing.service";
import { JwtEncoder } from "./../encoding/jwt.service";
import { Router } from "@angular/router";
import { User } from "../../model/user.data";
import { ErrorService } from "../error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { UserFactory } from "../user.factory";
import { Auth } from "./auth.service"
import { TestBed, async, inject } from "@angular/core/testing";
import { AuthConfiguration } from "./auth.config";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";


describe("auth.service.ts", () => {

    const expiredToken = encodeTestToken({
        "exp": 0
    });
    const validToken = encodeTestToken({
        "exp": 9999999999
    });
    const noExpiryToken = encodeTestToken({
        "sub": "1234567890",
        "name": "John Doe",
        "admin": true
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AuthConfiguration, useClass: class {
                        getLock = jasmine.createSpy("getLock").and.callFake(() => {
                            let mock = jasmine.createSpyObj("lock", ["on"]);
                            return mock;
                        })
                        ;
                    }
                },
                Auth, UserFactory, DatasetFactory, JwtEncoder, MailingService, LoaderService,
                { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
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
            imports: [RouterTestingModule]
        });

        localStorage.clear();
    });

    describe("logout", () => {
        it("should clean remove profile and toek from localStorage", inject([Auth, Router], (auth: Auth, router: Router) => {
            spyOn(localStorage, "clear")
            auth.logout();
            expect(localStorage.clear).toHaveBeenCalled();
        }));

        it("should redirect to /home", inject([Auth, Router], (auth: Auth, router: Router) => {
            auth.logout();
            expect(router.navigate).toHaveBeenCalledWith(["home"]);
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

});