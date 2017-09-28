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