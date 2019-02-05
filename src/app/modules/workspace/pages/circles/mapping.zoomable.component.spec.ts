import { Initiative } from "./../../../../shared/model/initiative.data";
import { ErrorService } from "./../../../../shared/services/error/error.service";
import { authHttpServiceFactoryTesting } from "../../../../../test/specs/shared/authhttp.helper.shared";
import { UserFactory } from "../../../../core/http/user/user.factory";
import { URIService } from "../../../../shared/services/uri/uri.service";
import { UIService } from "../../services/ui.service";
import { DataService } from "../../services/data.service";
import { ColorService } from "../../services/color.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { Router, NavigationStart, ActivatedRoute } from "@angular/router";
import { Observable, Subject } from "rxjs/Rx";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import { RouterTestingModule } from "@angular/router/testing";
import { MarkdownService } from "ngx-markdown";
import { MappingZoomableComponent } from "./mapping.zoomable.component";
import { NgProgress } from "@ngx-progressbar/core";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { DeviceDetectorService } from "ngx-device-detector";
import { DataSet } from "../../../../shared/model/dataset.data";
import { Team } from "../../../../shared/model/team.data";

describe("mapping.zoomable.component.ts", () => {

    let component: MappingZoomableComponent;
    let target: ComponentFixture<MappingZoomableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DeviceDetectorService,
                ColorService, DataService, UIService, URIService, UserFactory, Angulartics2Mixpanel, Angulartics2,
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
                },
                {
                    provide: LoaderService,
                    useClass: class {
                        hide = jasmine.createSpy("hide")
                        show = jasmine.createSpy("show")
                    },
                    deps: [NgProgress]
                },
                NgProgress,
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService,
                MarkdownService,
                {
                    provide: Router, useClass: class {
                        navigate = jasmine.createSpy("navigate");
                        events = Observable.of(new NavigationStart(0, "/next"))
                    }
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: Observable.of({ id: 123456})
                    }
                }
            ],
            declarations: [MappingZoomableComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingZoomableComponent);
        component = target.componentInstance;

        component.width = window.screen.availWidth;
        component.height = window.screen.availHeight;
        component.margin = 50;
        component.translateX = 100
        component.translateY = 100
        component.scale = 1;
        component.zoom$ = Observable.of(1);
        component.selectableTags$ = Observable.of([]);
        component.isReset$ = new Subject<boolean>();
        component.mapColor$ = Observable.of("")
        component.zoomInitiative$ = Observable.of(new Initiative());
        component.isLocked$ = Observable.of(true);
        component.analytics = jasmine.createSpyObj("analytics", ["eventTrack"]);

        let data = new Initiative().deserialize(fixture.load("data.json"));
        let mockDataService = target.debugElement.injector.get(DataService);
        spyOn(mockDataService, "get").and.returnValue(Observable.of({ initiative: data, dataset: new DataSet({datasetId:"123"}), team : new Team({}), members : [] }));
        spyOn(component.uiService, "getCircularPath");
        spyOn(localStorage, "getItem").and.returnValue(`{"fontColor":"#000","mapColor":"#aaa","fontSize":1,"explorationMode":false}`)

        target.detectChanges(); // trigger initial data binding
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/workspace/mapping/zoomable/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });

    it("should draw SVG with correct size when data is valid", () => {
        let svgs = document.querySelectorAll("svg#map")
        expect(svgs.length).toBe(1);
        expect(svgs.item(0).getAttribute("width")).toBe(`${component.width}`);
        expect(svgs.item(0).getAttribute("height")).toBe(`${component.height}`);
    });

    it("should draw SVG centered when data is valid", () => {
        let svgs = document.querySelectorAll("svg#map")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);

        expect(svg.querySelector("g")).toBeDefined();
        expect(svg.querySelector("g").transform.baseVal.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_TRANSLATE);
        expect(Math.round(svg.querySelector("g").transform.baseVal.getItem(0).matrix.e)).toBe(component.translateX);
        expect(Math.round(svg.querySelector("g").transform.baseVal.getItem(0).matrix.f)).toBe(component.translateY);
    });

    it("should draw SVG with correct number of circles when data is valid", () => {
        let svgs = document.querySelectorAll("svg#map")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelectorAll("circle.node.node--root").length).toBe(1);
        expect(g.querySelectorAll("circle.node").length).toBe(3);
    });

    it("should draw SVG with correct text labels  when data is valid", () => {
        let svgs = document.querySelectorAll("svg#map")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelectorAll(".name").length).toBe(3)
        expect(g.querySelectorAll(".name")[0].textContent).toBe("");
        expect(g.querySelectorAll(".name")[1].querySelector("foreignObject")).toBeDefined()
        expect(g.querySelectorAll(".name")[2].querySelector("foreignObject")).toBeDefined()
    });

    it("should calculate paths when data is valid", () => {

        expect(component.uiService.getCircularPath).toHaveBeenCalledTimes(3);
        let svg = document.querySelectorAll("svg#map").item(0)
        let defs = svg.querySelector("defs");
        expect(defs.querySelectorAll("path").length).toBe(3);
        expect(defs.querySelectorAll("path#path0")).toBeDefined();
        expect(defs.querySelectorAll("path#path1")).toBeDefined();
        expect(defs.querySelectorAll("path#path2")).toBeDefined();
    });




});
