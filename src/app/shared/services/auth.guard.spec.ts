import { Router, RouterStateSnapshot } from "@angular/router";
import { ErrorService } from "./error.service";
import { Http, BaseRequestOptions } from "@angular/http";
import { UserFactory } from "./user.factory";
import { Auth } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { TestBed, inject } from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";

export class AuthStub {
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
        it("should return true when user is authenticated", inject([AuthGuard, Auth, Router], (target: AuthGuard, mockAuth: AuthStub, mockRouter: Router) => {
            let route = jasmine.createSpyObj("route", [""]);
            let state = jasmine.createSpyObj<RouterStateSnapshot>("state", [""]);

            let spyAuth = spyOn(mockAuth, "authenticated").and.returnValue(true);

            expect(target.canActivate(route, state)).toBe(true);
            expect(spyAuth).toHaveBeenCalled();
        }));

        it("should return false when user is not authenticated, redirect to /login and store current url in web storage", inject([AuthGuard, Auth, Router], (target: AuthGuard, mockAuth: AuthStub, mockRouter: Router) => {
            let route = jasmine.createSpyObj("route", [""]);
            let state = jasmine.createSpyObj<RouterStateSnapshot>("state", [""]);
            let URL = "http://where.am.i.from.com";
            state.url = URL;
            let spyAuth = spyOn(mockAuth, "authenticated").and.returnValue(false);

            expect(localStorage.getItem("redirectUrl")).toBe(null)
            let actual = target.canActivate(route, state);
            expect(actual).toBe(false);
            expect(localStorage.getItem("redirectUrl")).toBe(URL);
            expect(spyAuth).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(["/login"]);
        }));

    });


});