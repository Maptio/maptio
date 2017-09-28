import { Router, RouterStateSnapshot } from "@angular/router";
import { ErrorService } from "../error/error.service";
import { Http, BaseRequestOptions } from "@angular/http";
import { UserFactory } from "../user.factory";
import { AuthGuard } from "./auth.guard";
import { TestBed, inject } from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import { Auth } from "../auth/auth.service";

export class AuthStub {
    authenticationProviderAuthenticated() { }

    internalApiAuthenticated() { }

    authenticated() { }
}


describe("auth.guard.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthGuard, UserFactory, ErrorService,
                { provide: Auth, useClass: AuthStub },
                { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
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

        localStorage.clear();
    })

    describe("canActivate", () => {
        it("should return true when user is authenticated and api is authenticated", inject([AuthGuard, Auth, Router], (target: AuthGuard, mockAuth: AuthStub, mockRouter: Router) => {
            let route = jasmine.createSpyObj("route", [""]);
            let state = jasmine.createSpyObj<RouterStateSnapshot>("state", [""]);

            let spyAuth = spyOn(mockAuth, "authenticated").and.returnValue(true);

            let spyApi = spyOn(mockAuth, "authenticationProviderAuthenticated").and.returnValue(true);
            let spyMaptioApi = spyOn(mockAuth, "internalApiAuthenticated").and.returnValue(true);

            expect(target.canActivate(route, state)).toBe(true);
            expect(spyAuth).toHaveBeenCalled();
        }));

        // fit("should return false when user is not authenticated, redirect to /login and store current url in web storage", inject([AuthGuard, Auth, Router], (target: AuthGuard, mockAuth: AuthStub, mockRouter: Router) => {
        //     let route = jasmine.createSpyObj("route", [""]);
        //     let state = jasmine.createSpyObj<RouterStateSnapshot>("state", [""]);
        //     let URL = "http://where.am.i.from.com";
        //     state.url = URL;
        //     let spyAuth = spyOn(mockAuth, "authenticated").and.returnValue(false);

        //     expect(localStorage.getItem("redirectUrl")).toBe(null)
        //     let actual = target.canActivate(route, state);
        //     expect(actual).toBe(false);
        //     expect(localStorage.getItem("redirectUrl")).toBe(URL);
        //     expect(spyAuth).toHaveBeenCalled();
        //     expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
        // }));

    });


});