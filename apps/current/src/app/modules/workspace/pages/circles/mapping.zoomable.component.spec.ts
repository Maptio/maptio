
import {of as observableOf,  Observable, Subject } from 'rxjs';
import { Initiative } from "./../../../../shared/model/initiative.data";
import { ErrorService } from "./../../../../shared/services/error/error.service";
import { authHttpServiceFactoryTesting } from "../../../../core/mocks/authhttp.helper.shared";
import { DataService } from "../../services/data.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { Router, NavigationStart, ActivatedRoute } from "@angular/router";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed, ComponentFixture, waitForAsync } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { MappingZoomableComponent } from "./mapping.zoomable.component";
import { NgProgress } from "@ngx-progressbar/core";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { DataSet } from "../../../../shared/model/dataset.data";
import { Team } from "../../../../shared/model/team.data";
import { WorkspaceModule } from "../../workspace.module";
import { CoreModule } from "../../../../core/core.module";
import { SharedModule } from "../../../../shared/shared.module";
const fixtures = require("./fixtures/data.json");

describe("mapping.zoomable.component.ts", () => {

    let component: MappingZoomableComponent;
    let target: ComponentFixture<MappingZoomableComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
                },
                {
                    provide: LoaderService,
                    useClass: class {
                        hide = jest.fn() 
                        show = jest.fn() 
                    },
                    deps: [NgProgress]
                },
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
                {
                    provide: Router, useClass: class {
                        navigate = jest.fn();
                        events = observableOf(new NavigationStart(0, "/next"))
                    }
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: observableOf({ id: 123456})
                    }
                }
            ],
            declarations: [],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, WorkspaceModule, CoreModule, SharedModule.forRoot()]
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
        component.zoom$ = observableOf(1);
        component.selectableTags$ = observableOf([]);
        component.isReset$ = new Subject<boolean>();
        component.mapColor$ = observableOf("")
        component.zoomInitiative$ = observableOf(new Initiative());
        component.isLocked$ = observableOf(true);
       
        let data = new Initiative().deserialize(fixtures);
        let mockDataService = target.debugElement.injector.get(DataService);
        spyOn(mockDataService, "get").and.returnValue(observableOf({ initiative: data, dataset: new DataSet({datasetId:"123"}), team : new Team({}), members : [] }));
        spyOn(component.uiService, "getCircularPath");
        spyOn(localStorage, "getItem").and.returnValue(`{"fontColor":"#000","mapColor":"#aaa","fontSize":1,"explorationMode":false}`)

        target.detectChanges(); // trigger initial data binding
    });

    // beforeAll(() => {
    //     fixture.setBase("src/app/components/workspace/mapping/zoomable/fixtures");
    // });

    // afterEach(() => {
    //     fixture.cleanup();
    // });

    it("should draw SVG with correct size when data is valid", () => {
        let svgs = document.querySelectorAll("svg#map")
        expect(svgs.length).toBe(1);
        expect(svgs.item(0).getAttribute("width")).toBe(`100%`);
        expect(svgs.item(0).getAttribute("height")).toBe(`100%`);
    });

    xit("should draw SVG centered when data is valid", () => {
        let svgs = document.querySelectorAll("svg#map")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);

        expect(svg.querySelector("g")).toBeDefined();
        expect(svg.querySelector("g").getAttribute("transform")).toBe(`translate(${component.translateX}, ${component.translateY}) scale(1)`);
      });

    xit("should draw SVG with correct number of circles when data is valid", () => {
        let svgs = document.querySelectorAll("svg#map")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelectorAll("circle.node.node--root").length).toBe(1);
        expect(g.querySelectorAll("circle.node").length).toBe(3);
    });

    xit("should draw SVG with correct text labels  when data is valid", () => {
        let svgs = document.querySelectorAll("svg#map")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelectorAll(".name").length).toBe(3)
        expect(g.querySelectorAll(".name")[0].textContent).toBe("");
        expect(g.querySelectorAll(".name")[1].querySelector("foreignObject")).toBeDefined()
        expect(g.querySelectorAll(".name")[2].querySelector("foreignObject")).toBeDefined()
    });

    xit("should calculate paths when data is valid", () => {

        expect(component.uiService.getCircularPath).toHaveBeenCalledTimes(3);
        let svg = document.querySelectorAll("svg#map").item(0)
        let defs = svg.querySelector("defs");
        expect(defs.querySelectorAll("path").length).toBe(3);
        expect(defs.querySelectorAll("path#path0")).toBeDefined();
        expect(defs.querySelectorAll("path#path1")).toBeDefined();
        expect(defs.querySelectorAll("path#path2")).toBeDefined();
    });




});
