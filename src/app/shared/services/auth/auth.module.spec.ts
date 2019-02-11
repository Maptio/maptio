import { authHttpServiceFactory } from "./auth.module";
import { Http, BaseRequestOptions } from "@angular/http";
import { Auth } from "../../../core/authentication/auth.service";
import { Router } from "@angular/router";
import { TestBed, inject } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { MockBackend } from "@angular/http/testing";
import { CoreModule } from "../../../core/core.module";
import { SharedModule } from "../../shared.module";
import { AnalyticsModule } from "../../../core/analytics.module";

describe("auth.module.ts", () => {

    let http:Http, auth:Auth, options:BaseRequestOptions, router:Router;

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
                MockBackend, BaseRequestOptions
            ],
            imports: [RouterTestingModule, CoreModule, SharedModule, AnalyticsModule]
        });

        http = TestBed.get(Http);
        auth = TestBed.get(Auth);
        options = TestBed.get(BaseRequestOptions);
        router = TestBed.get(Router);
    });

    it("should have the right configuration", () => {
        
        let httpInterceptor = authHttpServiceFactory(http, options, auth, router);
        expect(httpInterceptor.getConfig().getConfig().tokenName).toBe("maptio_api_token");
        expect(httpInterceptor.getConfig().getConfig().globalHeaders).toEqual([{ "Content-Type": "application/json" }]);

        localStorage.setItem("maptio_api_token", "MAPTIO_TOKEN")
        expect(httpInterceptor.getConfig().getConfig().tokenGetter()).toBe("MAPTIO_TOKEN")
    });


});