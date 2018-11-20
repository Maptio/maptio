import { ExportService } from '../../../shared/services/export/export.service';
import { Team } from '../../../shared/model/team.data';
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";
import { Initiative } from "../../../shared/model/initiative.data";
import { URIService } from "../../../shared/services/uri.service";
import { DataService } from "../../../shared/services/data.service";
import { UserFactory } from "../../../shared/services/user.factory";
import { RouterTestingModule } from "@angular/router/testing";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import { ActivatedRoute } from "@angular/router";
import { UIService } from "../../../shared/services/ui/ui.service";
import { ColorService } from "../../../shared/services/ui/color.service";
import { D3Service } from "d3-ng2-service";
import { Observable } from "rxjs/Observable";
import { ErrorService } from "../../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { MappingTreeComponent } from "./tree/mapping.tree.component";
// import { MappingCirclesComponent } from "./circles/mapping.circles.component";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { MappingComponent } from "./mapping.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { AuthHttp } from "angular2-jwt";
import { IDataVisualizer } from "./mapping.interface";
import { MappingNetworkComponent } from "./network/mapping.network.component";
import { MappingZoomableComponent } from "./zoomable/mapping.zoomable.component";
import { MarkdownService } from "angular2-markdown";
import { Intercom, IntercomConfig } from 'ng-intercom';
import { MappingSummaryComponent } from './summary/summary.component';
import { DeviceDetectorService } from 'ngx-device-detector';

describe("mapping.component.ts", () => {

    let component: MappingComponent;
    let target: ComponentFixture<MappingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DeviceDetectorService,
                DataService, ErrorService, D3Service, ColorService, URIService, Angulartics2Mixpanel, Angulartics2,
                UserFactory, ExportService, Intercom, IntercomConfig,
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
                MarkdownService,
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
            declarations: [MappingComponent, MappingTreeComponent,
                MappingNetworkComponent, MappingSummaryComponent, MappingZoomableComponent],
            imports: [RouterTestingModule]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingComponent);
        component = target.componentInstance;
        component.VIEWPORT_WIDTH = 1000;
        component.team = new Team({ name: "team", team_id: "TEAMID" });
        target.detectChanges(); // trigger initial data binding
    });

    describe("Controller", () => {

        describe("zoomIn", () => {
            it("should set the zoom factor to 1.1", async(() => {
                let spy = spyOn(component.zoom$, "next");
                component.zoomIn();
                expect(spy).toHaveBeenCalledWith(1.1)
            }));
        });

        describe("zoomOut", () => {
            it("should set the zoom factor to 1.1", async(() => {
                let spy = spyOn(component.zoom$, "next");
                component.zoomOut();
                expect(spy).toHaveBeenCalledWith(0.9)
            }));
        });

        describe("getFragment", () => {
            it("should return correct fragment  when layout is initiatives", () => {
                let actual = component.getFragment(new MappingZoomableComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe(`x=${(component.VIEWPORT_WIDTH - 20) / 2 }&y=${(component.VIEWPORT_WIDTH - 20) / 2}&scale=1`)
            });

            it("should return correct fragment when layout is people", () => {
                let actual = component.getFragment(new MappingTreeComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe(`x=${component.VIEWPORT_WIDTH / 10}&y=${component.VIEWPORT_HEIGHT / 2}&scale=1`)
            });

            it("should return correct fragment when layout is network", () => {
                let actual = component.getFragment(new MappingNetworkComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe(`x=0&y=${-component.VIEWPORT_HEIGHT / 4}&scale=1`)
            });

            it("should return correct fragment  when layout is list", () => {
                let actual = component.getFragment(new MappingSummaryComponent(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
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

        describe("change font size", () => {
            it("should chnage font size", () => {
                spyOn(component.fontSize$, "next");
                spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
                component.changeFontSize(12);
                expect(component.fontSize$.next).toHaveBeenCalledWith(12);
                expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
            });
        });

        describe("change font color", () => {
            it("should change font color", () => {
                spyOn(component.fontColor$, "next");
                spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
                component.changeFontColor("color")
                expect(component.fontColor$.next).toHaveBeenCalledWith("color");
                expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
            });
        });


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
            let activated = <IDataVisualizer>new MappingNetworkComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined)
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