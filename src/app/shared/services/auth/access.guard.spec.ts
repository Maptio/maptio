import { Observable } from "rxjs/Rx"; 
import { AccessGuard } from "./access.guard";
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { ErrorService } from "../error/error.service";
import { Http, BaseRequestOptions } from "@angular/http";
import { UserFactory } from "../user.factory";
import { Auth } from "./auth.service";
import { TestBed, inject } from "@angular/core/testing";
import { MockBackend } from "@angular/http/testing";
import { User } from "../../model/user.data";

export class AuthStub {
    getUser() { }
}


describe("access.guard.ts", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AccessGuard, UserFactory, ErrorService,
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
        it("should return true when user is authorized to access", inject([AccessGuard, Auth, Router], (target: AccessGuard, mockAuth: AuthStub, mockRouter: Router) => {
            let route = jasmine.createSpyObj<ActivatedRouteSnapshot>("route", ["params"]);

            route.params["workspaceid"] = "id1";
            let state = jasmine.createSpyObj<RouterStateSnapshot>("state", [""]);

            let spyAuth = spyOn(mockAuth, "getUser").and.returnValue(Observable.of<User>(new User({ name: "John Doe", datasets: ["id1", "id2"] })));

            target.canActivate(route, state).toPromise().then((result) => {
                expect(result).toBe(true);
                expect(spyAuth).toHaveBeenCalled();
            })
        }));

        it("should return false when user is not authorized then redirect to /unauthorized", inject([AccessGuard, Auth, Router], (target: AccessGuard, mockAuth: AuthStub, mockRouter: Router) => {
            let route = jasmine.createSpyObj<ActivatedRouteSnapshot>("route", ["params"]);

            route.params["workspaceid"] = "id3";
            let state = jasmine.createSpyObj<RouterStateSnapshot>("state", [""]);

            let spyAuth = spyOn(mockAuth, "getUser").and.returnValue(Observable.of<User>(new User({ name: "John Doe", datasets: ["id1", "id2"] })));

            target.canActivate(route, state).toPromise().then((result) => {
                expect(result).toBe(false);
                expect(spyAuth).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith(["/unauthorized"])
            });
        }));

    });


});