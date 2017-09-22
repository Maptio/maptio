import { AuthHttp } from "angular2-jwt";
import { LoaderService } from "./../http/loader.service";
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
                Auth, UserFactory, JwtEncoder, MailingService, LoaderService,
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

    // describe("setUser", () => {
    //     it("should store profile in local storage", inject([Auth, UserService], (auth: Auth, userService:UserService) => {
    //         expect(localStorage.getItem("profile")).toBe(null);
    //         let profile = { user_id: "some unique id" };

    //         auth.setUser(profile);
    //         expect(localStorage.getItem("profile")).toBeDefined();
    //     }));

    //     it("should get user and set it as observable", async(inject([Auth], (auth: Auth) => {
    //         let profile = { user_id: "some_unique_id" };

    //         let spyGet = spyOn(auth.userFactory, "get").and.returnValue(Promise.resolve(new User({ user_id: "resolved" })));
    //         auth.setUser(profile);

    //         expect(spyGet).toHaveBeenCalledWith("some_unique_id");
    //         auth.getUser().subscribe((user: User) => { expect(user.user_id).toBe("resolved") });
    //     })));

    //     xit("should upsert user if it doesnt exist yet", async(inject([Auth], (auth: Auth) => {
    //         let profile = { user_id: "some_unique_id" };

    //         let spyGet = spyOn(auth.userFactory, "get").and.returnValue(Promise.reject<User>(undefined));
    //         let spyUpsert = spyOn(auth.userFactory, "upsert");
    //         auth.setUser(profile);

    //         spyGet.calls.mostRecent().returnValue
    //             .then(() => { })
    //             .catch((reason: any) => {
    //                 expect(spyUpsert).toHaveBeenCalledWith(jasmine.objectContaining({ user_id: "some_unique_id" }));
    //             });
    //         // FIXME : should expect the getUser to return set user
    //         // auth.getUser().toPromise()
    //         //     .then((user: User) => { expect(user.user_id).toBe("some_unique_id") })
    //         //     .catch((reason: any) => { });
    //     })));

    //     // FIXME : should throw if Auth) returns garbage
    //     xit("should throw when user is invalid", inject([Auth], (auth: Auth) => {
    //         let profile = { not_an_id: "some unique id" };
    //         expect(function () { auth.setUser(profile) }).toThrowError();
    //     }));
    // });

    describe("logout", () => {
        it("should clean remove profile and toek from localStorage", inject([Auth, Router], (auth: Auth, router: Router) => {
            localStorage.setItem("profile", "some profile information");
            localStorage.setItem("id_token", "some token");
            expect(localStorage.getItem("profile")).toBeDefined();
            expect(localStorage.getItem("id_token")).toBeDefined();
            auth.logout();
            expect(localStorage.getItem("profile")).toBe(null)
            expect(localStorage.getItem("id_token")).toBe(null);
            expect(router.navigate).toHaveBeenCalled();
        }));

        it("should redirect to /home", inject([Auth, Router], (auth: Auth, router: Router) => {
            auth.logout();
            expect(router.navigate).toHaveBeenCalledWith(["home"]);
        }));
    });
});