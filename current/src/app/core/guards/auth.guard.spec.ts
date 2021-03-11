import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { ErrorService } from "../../shared/services/error/error.service";
import { Http, BaseRequestOptions } from "@angular/http";
import { UserFactory } from "../http/user/user.factory";
import { AuthGuard } from "./auth.guard";
import { TestBed, inject } from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import { Auth } from "../authentication/auth.service";

export class AuthStub {
    clear() { }

    allAuthenticated() { }
}


describe("auth.guard.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthGuard, UserFactory, ErrorService,
                { provide: Auth, useClass: AuthStub },
                { provide: ActivatedRouteSnapshot, useClass: class { } },
                { provide: RouterStateSnapshot, useClass: class { } },
                { provide: Router, useClass: class { navigate = jest.fn(); } },
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
            let route = TestBed.get(ActivatedRouteSnapshot);
            let state = TestBed.get(RouterStateSnapshot);

            let spyAuth = spyOn(mockAuth, "allAuthenticated").and.returnValue(true);

            expect(target.canActivate(route, state)).toBe(true);
            expect(spyAuth).toHaveBeenCalled();
        }));

    });


});