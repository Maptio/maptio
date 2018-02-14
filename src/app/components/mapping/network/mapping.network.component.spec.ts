import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { Router, NavigationStart } from "@angular/router";
import { UserFactory } from "./../../../shared/services/user.factory";
import { Observable, Subject } from "rxjs/Rx";
import { NO_ERRORS_SCHEMA } from "@angular/core";
// import { TooltipComponent } from "./../tooltip/tooltip.component";
import { Initiative } from "./../../../shared/model/initiative.data";
import { UIService } from "./../../../shared/services/ui/ui.service";
import { ColorService } from "./../../../shared/services/ui/color.service";
import { D3Service, D3 } from "d3-ng2-service";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";
import { ErrorService } from "../../../shared/services/error/error.service";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2/dist";
import { RouterTestingModule } from "@angular/router/testing";
import { MappingNetworkComponent } from "./mapping.network.component";
import { DataService, URIService } from "../../../shared/services/data.service";
import { MarkdownService } from "angular2-markdown";

describe("mapping.network.component.ts", () => {

    let component: MappingNetworkComponent;
    let target: ComponentFixture<MappingNetworkComponent>;
    let d3: D3;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                D3Service, ColorService, UIService, URIService, DataService, UserFactory, Angulartics2Mixpanel, Angulartics2,
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
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
                MarkdownService,
                {
                    provide: Router, useClass: class {
                        navigate = jasmine.createSpy("navigate");
                        events = Observable.of(new NavigationStart(0, "/next"))
                    }
                }
            ],
            declarations: [MappingNetworkComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingNetworkComponent);
        component = target.componentInstance;
        d3 = component.d3Service.getD3();

        component.width = 1000;
        component.height = 1000;
        component.margin = 50;
        component.translateX = 100
        component.translateY = 100
        component.scale = 1;
        component.zoom$ = Observable.of(1);
        component.isReset$ = new Subject<boolean>();
        component.selectableTags$ = Observable.of([]);
        component.fontSize$ = Observable.of(12);
        component.fontColor$ = Observable.of("");
        component.mapColor$ = Observable.of("")
        component.zoomInitiative$ = Observable.of(new Initiative());

        // component.isLocked$ = Observable.of(true);
        component.analytics = jasmine.createSpyObj("analytics", ["eventTrack"]);

        let data = new Initiative().deserialize(fixture.load("data.json"));
        let mockDataService = target.debugElement.injector.get(DataService);
        spyOn(mockDataService, "get").and.returnValue(Observable.of({ initiative: data, datasetId: "ID" }));

        target.detectChanges(); // trigger initial data binding
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/mapping/network/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });

    it("should draw SVG with correct size when data is valid", () => {
        // let data = new Initiative().deserialize(fixture.load("data.json"));
        // component.data$.next({ initiative: data, datasetId: "ID" })

        let svg = document.getElementsByTagName("svg")
        expect(svg.length).toBe(1);
        expect(svg.item(0).viewBox.baseVal.width).toBe(1522);
        expect(svg.item(0).viewBox.baseVal.height).toBe(1522); // these are harcoded for now
        expect(svg.item(0).getAttribute("width")).toBe("1522");
        expect(svg.item(0).getAttribute("height")).toBe("1522");
    });

    it("should draw SVG centered when data is valid", () => {
        // let data = new Initiative().deserialize(fixture.load("data.json"));
        // component.data$.next({ initiative: data, datasetId: "ID" })

        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);

        expect(svg.querySelector("g")).toBeDefined();
        expect(svg.querySelector("g").transform.baseVal.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_TRANSLATE);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.e).toBe(100);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.f).toBe(100);
    });

    it("should draw SVG with correct number of node when data is valid", () => {
        // let data = new Initiative().deserialize(fixture.load("data.json"));
        // component.data$.next({ initiative: data, datasetId: "ID" })

        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelectorAll("g.nodes > g.node > circle").length).toBe(6);
    });

    it("should draw SVG with correct text labels  when data is valid", () => {
        // let data = new Initiative().deserialize(fixture.load("data.json"));
        // component.data$.next({ initiative: data, datasetId: "ID" })

        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        // console.log(g.querySelectorAll("g.labels > text.edge"))
        expect(g.querySelectorAll("g.labels > text.edge").length).toBe(4);
    });

    // describe("hoverLink", () => {
    //     it("should gather initiatives when there is a match", () => {
    //         let data = new Initiative().deserialize(fixture.load("data.json"));
    //         let nodes = d3.hierarchy(data).descendants().map(d => d.data);

    //         component.hoverLink(nodes, ["2"], "22", "2");

    //         expect(component.tooltipInitiatives.length).toBe(1);
    //         expect(component.tooltipInitiatives[0].name).toBe("Marketing");
    //         expect(component.tooltipInitiatives[0].id.toString()).toBe("2");
    //         expect(component.tooltipRoles.length).toBe(1)
    //         expect(component.tooltipRoles[0].initiative.id.toString()).toBe("2");
    //         expect(component.tooltipRoles[0].role.description).toBe("helping with something");
    //     });

    //     it("should not gather initiatives when there is no match", () => {
    //         let data = new Initiative().deserialize(fixture.load("data.json"));
    //         let nodes = d3.hierarchy(data).descendants().map(d => d.data);

    //         component.hoverLink(nodes, ["99"], "22", "2");

    //         expect(component.tooltipInitiatives).toEqual([]);
    //         expect(component.tooltipRoles).toBeUndefined();
    //     });
    // });
});
