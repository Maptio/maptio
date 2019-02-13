import { MappingComponent } from "./mapping.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { Http, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { AuthHttp } from "angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../../core/mocks/authhttp.helper.shared";
import { UIService } from "../../services/ui.service";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { MappingTreeComponent } from "../../pages/tree/mapping.tree.component";
import { MappingNetworkComponent } from "../../pages/network/mapping.network.component";
import { MappingSummaryComponent } from "../../pages/directory/summary.component";
import { MappingZoomableComponent } from "../../pages/circles/mapping.zoomable.component";
import { RouterTestingModule } from "@angular/router/testing";
import { Team } from "../../../../shared/model/team.data";
import { Initiative } from "../../../../shared/model/initiative.data";
import { IDataVisualizer } from "./mapping.interface";
import { AnalyticsModule } from "../../../../core/analytics.module";
import { WorkspaceModule } from "../../workspace.module";
import * as screenfull from 'screenfull';
import { SharedModule } from "../../../../shared/shared.module";

describe("mapping.component.ts", () => {

    let component: MappingComponent;
    let target: ComponentFixture<MappingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
                }
                ,
                {
                    provide: UIService,
                    useValue: {
                        getCanvasWidth() { return 1000; },
                        getCanvasHeight() { return 1000; }
                    }
                },
                BaseRequestOptions,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: Observable.of({ mapid: 123, layout: "initiatives" }),
                        fragment: Observable.of(`x=50&y=50&scale=1.2`),
                        snapshot: { fragment: undefined },
                        queryParams: Observable.of({ id: "123345" })
                    }
                }

            ],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [],
            imports: [RouterTestingModule, AnalyticsModule, WorkspaceModule, SharedModule.forRoot()]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingComponent);
        component = target.componentInstance;
        component.fullScreenLib = {
            on : jest.fn()
        }
        component.VIEWPORT_WIDTH = 1000;
        component.team = new Team({ name: "team", team_id: "TEAMID" });
        target.detectChanges(); // trigger initial data binding
    });

    describe("Controller", () => {

        describe("zoomIn", () => {
            it("should set the zoom factor to 1.2", async(() => {
                let spy = spyOn(component.zoom$, "next");
                component.zoomIn();
                expect(spy).toHaveBeenCalledWith(3)
            }));
        });

        describe("zoomOut", () => {
            it("should set the zoom factor to 0.8", async(() => {
                let spy = spyOn(component.zoom$, "next");
                component.zoomOut();
                expect(spy).toHaveBeenCalledWith(1 / 3)
            }));
        });

        describe("getFragment", () => {
            it("should return correct fragment  when layout is initiatives", () => {
                let actual = component.getFragment(new MappingZoomableComponent(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe(`x=${(component.VIEWPORT_WIDTH - 20) / 2}&y=${(component.VIEWPORT_WIDTH - 20) / 2}&scale=1`)
            });

            it("should return correct fragment when layout is people", () => {
                let actual = component.getFragment(new MappingTreeComponent(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe(`x=${component.VIEWPORT_WIDTH / 10}&y=${component.VIEWPORT_HEIGHT / 2}&scale=1`)
            });

            it("should return correct fragment when layout is network", () => {
                let actual = component.getFragment(new MappingNetworkComponent(undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe(`x=0&y=${-component.VIEWPORT_HEIGHT / 4}&scale=1`)
            });

            it("should return correct fragment  when layout is list", () => {
                let actual = component.getFragment(new MappingSummaryComponent(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("x=0&y=0&scale=1")
            });
        });

        describe("resetZoom", () => {
            it("should reset zoom", () => {
                spyOn(component.isReset$, "next");
                spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
                component.resetZoom();
                expect(component.isReset$.next).toHaveBeenCalledWith(true);
                expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
            });
        });

        // describe("change font size", () => {
        //     it("should chnage font size", () => {
        //         spyOn(component.fontSize$, "next");
        //         spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
        //         component.changeFontSize(12);
        //         expect(component.fontSize$.next).toHaveBeenCalledWith(12);
        //         expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
        //     });
        // });

        // describe("change font color", () => {
        //     it("should change font color", () => {
        //         spyOn(component.fontColor$, "next");
        //         spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
        //         component.changeFontColor("color")
        //         expect(component.fontColor$.next).toHaveBeenCalledWith("color");
        //         expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
        //     });
        // });


        describe("change map color", () => {
            it("should change map color", () => {
                spyOn(component.mapColor$, "next");
                spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
                component.changeMapColor("color")
                expect(component.mapColor$.next).toHaveBeenCalledWith("color");
                expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
            });
        });

        describe("Searching", () => {
            it("should zoom on selected initiative", () => {
                spyOn(component.zoomToInitiative$, "next")
                component.zoomToInitiative(new Initiative());
                expect(component.zoomToInitiative$.next).toHaveBeenCalled();
            });
        });

        it("onActivate", () => {
            let activated = <IDataVisualizer>new MappingNetworkComponent(undefined, undefined, undefined, undefined, undefined, undefined)
            spyOn(component, "getFragment").and.returnValue("x=10&y=100&scale=1.3")

            component.onActivate(activated);
            expect(activated.width).toBe(1000);
            expect(activated.height).toBe(1000);
            expect(component.getFragment).toHaveBeenCalledTimes(1);
            expect(activated.translateX).toBe(10);
            expect(activated.translateY).toBe(100);
            expect(activated.scale).toBe(1.3);
        })

    });
});