import { AppComponent } from "./app.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NgProgress } from "@ngx-progressbar/core";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { LoaderService } from "./shared/components/loading/loader.service";
import { Auth } from "./core/authentication/auth.service";
import { Router, NavigationEnd } from "@angular/router";
import { Observable } from "rxjs";
import { AnalyticsModule } from "./core/analytics.module";
import { CoreModule } from "./core/core.module";

describe("app.component.ts", () => {

    let component: AppComponent;
    let target: ComponentFixture<AppComponent>;


    beforeEach(async(() => {



        TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [RouterTestingModule, AnalyticsModule, CoreModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(AppComponent, {
            set: {
                providers: [
                    {
                        provide: LoaderService,
                        useClass: class {
                            hide = jest.fn()
                            show = jest.fn()
                        },
                        deps: [NgProgress]
                    },
                    NgProgress,
                    {
                        provide: Auth, useClass: class {
                            allAuthenticated() { return; }
                        }
                    },
                    {
                        provide: Router, useClass: class {
                            navigate = jest.fn();
                            public events = new Observable(observer => {
                                observer.next(new NavigationEnd(0, "/login", "/login"));
                                observer.complete();
                            });

                        }
                    }
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(AppComponent);

        component = target.componentInstance;
    });

    it('should behave...', () => {
        expect(true).toBe(true)
    });
    // it("should unsubscribe subscription when component is destroyed", () => {
    //     let spy = spyOn(component.routerSubscription, "unsubscribe");
    //     target.destroy();
    //     expect(spy).toHaveBeenCalled();
    // })

    // describe("isUrlHome", () => {
    //     it("should return true when url is /home", () => {
    //         let url = "/home"
    //         expect(component.isUrlHome(url)).toBeTruthy()
    //     })

    //     it("should return true when url starts with /home", () => {
    //         let url = "/home?token=TOKEN"
    //         expect(component.isUrlHome(url)).toBeTruthy()
    //     })

    //     it("should return true when url is /", () => {
    //         let url = "/"
    //         expect(component.isUrlHome(url)).toBeTruthy()
    //     })

    //     it("should return false when url is not home URL", () => {
    //         let url = "/nothome"
    //         expect(component.isUrlHome(url)).toBeFalsy()
    //     })
    // })

    // describe("isUrlMap", () => {
    //     it("should return true when url is /map", () => {
    //         let url = "/map"
    //         expect(component.isUrlMap(url)).toBeTruthy()
    //     })

    //     it("should return true when url starts with /map", () => {
    //         let url = "/map/MAPID"
    //         expect(component.isUrlMap(url)).toBeTruthy()
    //     })

    //     it("should return false when url is not a map URL", () => {
    //         let url = "/notmap"
    //         expect(component.isUrlMap(url)).toBeFalsy()
    //     })
    // })












});
