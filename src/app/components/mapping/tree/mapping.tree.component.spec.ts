import { ErrorService } from "./../../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http } from "@angular/http";
import { BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { UserFactory } from "./../../../shared/services/user.factory";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { Observable, Subject } from "rxjs/Rx";
import { Initiative } from "./../../../shared/model/initiative.data";
import { UIService } from "./../../../shared/services/ui/ui.service";
import { ColorService } from "./../../../shared/services/ui/color.service";
import { D3Service, D3 } from "d3-ng2-service";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { MappingTreeComponent } from "./mapping.tree.component";
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";

describe("mapping.tree.component.ts", () => {

    let component: MappingTreeComponent;
    let target: ComponentFixture<MappingTreeComponent>;
    let d3: D3;
    let data$: Subject<{ initiative: Initiative, datasetId: string }> = new Subject<{ initiative: Initiative, datasetId: string }>();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                D3Service, ColorService, UIService, UserFactory,
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
                { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } }
            ],
            declarations: [MappingTreeComponent],
            imports: [RouterTestingModule]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingTreeComponent);
        component = target.componentInstance;
        d3 = component.d3Service.getD3();

        component.width = 1000;
        component.height = 1000;
        component.margin = 50;
        component.translateX = 100;
        component.translateY = 100;
        component.scale = 1;
        component.zoom$ = Observable.of(1)
        component.isReset$ = new Subject<boolean>();
        component.fontSize$ = Observable.of(12);

        target.detectChanges(); // trigger initial data binding
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/mapping/tree/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });


    /*
    <svg _ngcontent-a-0="" viewBox="0 0 1522 1522" width="100%">
        <path class="link" d="M 0 500&#10;            C 0 500,&#10;       0 500,&#10;              0 500"></path>
        <path class="link" d="M 0 500&#10;            C 0 500,&#10;              0 500,&#10;0 500"></path>
        <defs>
            <pattern id="image0" width="100%" height="100%">
                <image width="30" height="30" xmlns:xlink="" xlink:href=""></image>
            </pattern>
            <pattern id="image1" width="100%" height="100%">
                <image width="30" height="30" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://cto.image.png"></image>
            </pattern>
            <pattern id="image3" width="100%" height="100%">
                <image width="30" height="30" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://cmo.image.png"></image>
            </pattern>
        </defs>
        <g transform="translate(500,500)"></g>
        <g class="node" transform="translate(0,500)">
            <circle class="node" r="10" cursor="pointer" fill="url(#image0)"></circle>
            <text class="name" dy="1.65em" x="15">My Company</text>
            <text class="accountable" dy="5" x="15"></text>
        </g>
        <g class="node" transform="translate(0,500)">
            <circle class="node" r="10" cursor="pointer" fill="url(#image1)"></circle>
            <text class="name" dy="1.65em" x="15">Tech</text>
            <text class="accountable" dy="5" x="15">CTO</text>
        </g>
        <g class="node" transform="translate(0,500)">
            <circle class="node" r="10" cursor="pointer" fill="url(#image2)"></circle>
            <text class="name" dy="1.65em" x="15">Marketing</text><text class="accountable" dy="5" x="15">CMO</text>
        </g>
    </svg>
*/

    it("should draw SVG with correct size when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" })
        // component.draw(data, 100, 100, 1);Ì
        let svg = document.getElementsByTagName("svg")
        expect(svg.length).toBe(1);
        expect(svg.item(0).viewBox.baseVal.width).toBe(1522);
        expect(svg.item(0).viewBox.baseVal.height).toBe(1522); // these are harcoded for now
        expect(svg.item(0).getAttribute("width")).toBe("1000");
    });

    it("should draw SVG with correct transform when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" });
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);

        expect(svg.querySelector("g")).toBeDefined();
        console.log(svg.querySelector("g"))
        expect(svg.querySelector("g").transform.baseVal.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_TRANSLATE);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.e).toBe(100);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.f).toBe(100);
    });

    it("should draw SVG with correct number of links when data is valid", () => {

        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" })
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);
        let paths = svg.querySelectorAll("path.link");
        expect(paths.length).toBe(2);
    });

    it("should draw SVG with correct number of nodes when data is valid", () => {
        // let data = new Initiative().deserialize(fixture.load("data.json"));

        // component.draw(data, 100, 100, 1);

        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" })
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);
        let nodes = svg.querySelectorAll("g.node");
        expect(nodes.length).toBe(3);
    });

    it("should draw SVG with correct text labels when data is valid", () => {

        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" })
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);
        let nodes = svg.querySelectorAll("g.node");
        expect(nodes.item(0).querySelector("text.name").textContent).toBe("My Company");
        expect(nodes.item(1).querySelector("text.name").textContent).toBe("Tech");
        expect(nodes.item(2).querySelector("text.name").textContent).toBe("Marketing");

        expect(nodes.item(0).querySelector("text.accountable").textContent).toBe("");
        expect(nodes.item(1).querySelector("text.accountable").textContent).toBe("CTO");
        expect(nodes.item(2).querySelector("text.accountable").textContent).toBe("CMO");
    });

    it("should draw SVG with correct pictures labels when data is valid", () => {

        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.data$.next({ initiative: data, datasetId: "ID" })
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);
        let nodes = svg.querySelectorAll("g.node");
        expect(nodes.item(0).querySelector("circle").getAttribute("fill")).toBe("#fff");
        expect(nodes.item(1).querySelector("circle").getAttribute("fill")).toBe("url(#image1)");
        expect(nodes.item(2).querySelector("circle").getAttribute("fill")).toBe("url(#image2)");

        let patterns = svg.querySelectorAll("g defs pattern");
        expect(patterns.item(0).querySelector("image")).toBe(null)
        expect(patterns.item(1).querySelector("image").getAttribute("href")).toBe("http://cto.image.png");
        expect(patterns.item(2).querySelector("image").getAttribute("href")).toBe("http://cmo.image.png");
    });


});
