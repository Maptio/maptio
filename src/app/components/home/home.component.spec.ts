import { HomeComponent } from "./home.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Auth } from "../../shared/services/auth.service";
import { AuthConfiguration } from "../../shared/services/auth.config";
import { UserFactory } from "../../shared/services/user.factory";
import { Http, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { Router } from "@angular/router";
import { ErrorService } from "../../shared/services/error.service";

describe("home.component.ts", () => {
    let component: HomeComponent;
    let target: ComponentFixture<HomeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HomeComponent],
            providers: [Auth, UserFactory,
                {
                    provide: AuthConfiguration, useClass: class {
                        getLock = jasmine.createSpy("getLock").and.callFake(() => {
                            let mock = jasmine.createSpyObj("lock", ["on"]);
                            return mock;
                        })
                        ;
                    }
                },
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                MockBackend,
                BaseRequestOptions,
                ErrorService]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(HomeComponent);
        component = target.componentInstance;

        target.detectChanges(); // trigger initial data binding
    });

    it("all dependencies are provided", () => {
        expect(true).toBe(true);
    })
});
