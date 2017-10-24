import { authHttpServiceFactory } from "./auth.module";
import { Http, RequestOptions, BaseRequestOptions } from "@angular/http";
import { Auth } from "./auth.service";
import { Router } from "@angular/router";
import { TestBed, inject } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { MockBackend } from "@angular/http/testing";
import { AuthConfiguration } from "./auth.config";
import { DatasetFactory } from "../dataset.factory";
import { UserFactory } from "../user.factory";
import { LoaderService } from "../loading/loader.service";
import { AuthHttp, AuthConfig } from "angular2-jwt/angular2-jwt";

describe("auth.module.ts", () => {


    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend, BaseRequestOptions,
                { provide: Auth, useClass: class { } },
            ],
            imports: [RouterTestingModule]
        });
    });

    it("should have the right configuration", inject([Http, BaseRequestOptions, Auth, Router], (http: Http, options: BaseRequestOptions, auth: Auth, router: Router) => {
        let httpInterceptor = authHttpServiceFactory(http, options, auth, router);
        expect(httpInterceptor.getConfig().getConfig().tokenName).toBe("maptio_api_token");
        expect(httpInterceptor.getConfig().getConfig().globalHeaders).toEqual([{ "Content-Type": "application/json" }]);

        spyOn(localStorage, "getItem")
        httpInterceptor.getConfig().getConfig().tokenGetter()
        expect(localStorage.getItem).toHaveBeenCalledWith("maptio_api_token")
    }));


});