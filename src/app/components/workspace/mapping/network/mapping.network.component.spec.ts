import { Team } from "./../../../../shared/model/team.data";
import { Helper } from "./../../../../shared/model/helper.data";
import { Initiative } from "./../../../../shared/model/initiative.data";
import { ErrorService } from "./../../../../shared/services/error/error.service";
import { authHttpServiceFactoryTesting } from "../../../../../test/specs/shared/authhttp.helper.shared";
import { UserFactory } from "./../../../../shared/services/user.factory";
import { DataService } from "./../../../../shared/services/data.service";
import { URIService } from "./../../../../shared/services/uri.service";
import { UIService } from "./../../../../shared/services/ui/ui.service";
import { ColorService } from "./../../../../shared/services/ui/color.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { Router, NavigationStart } from "@angular/router";
import { Observable, Subject } from "rxjs/Rx";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { D3Service, D3 } from "d3-ng2-service";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2/dist";
import { RouterTestingModule } from "@angular/router/testing";
import { MappingNetworkComponent } from "./mapping.network.component";
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

        component.height = window.screen.availHeight;
        component.width = window.screen.availWidth;
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
        component.zoomInitiative$ = Observable.of(new Initiative({ id: 1, accountable: new Helper(), helpers: [] }));

        component.toggleOptions$ = Observable.of(true);
        // component.isLocked$ = Observable.of(true);
        component.analytics = jasmine.createSpyObj("analytics", ["eventTrack"]);

        let data = new Initiative().deserialize(fixture.load("data.json"));
        let team = new Team({ team_id: "TEAMID", settings: { authority: "King", helper: "Minions" } })
        let mockDataService = target.debugElement.injector.get(DataService);
        spyOn(mockDataService, "get").and.returnValue(Observable.of({ initiative: data, datasetId: "ID", team: team }));

        target.detectChanges(); // trigger initial data binding
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/workspace/mapping/network/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });

    it("should draw SVG with correct size when data is valid", () => {
        let svg = document.getElementsByTagName("svg")
        expect(svg.length).toBe(1); // these are harcoded for now
        expect(svg.item(0).getAttribute("width")).toBe(`${component.width}`);
        expect(svg.item(0).getAttribute("height")).toBe(`${component.height}`);
    });

    it("should draw SVG centered when data is valid", () => {
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);

        expect(svg.querySelector("g")).toBeDefined();
        expect(svg.querySelector("g").transform.baseVal.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_TRANSLATE);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.e).toBe(100);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.f).toBe(100);
    });

    it("should draw SVG with correct number of node when data is valid", () => {
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelectorAll("g.nodes > g.node > circle").length).toBe(6);
    });

    it("should draw SVG with correct text labels  when data is valid", () => {
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelectorAll("g.labels > text.edge").length).toBe(4);
    });

});
