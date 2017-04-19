import { Initiative } from "./../../../shared/model/initiative.data";
import { UIService } from "./../../../shared/services/ui/ui.service";
import { ColorService } from "./../../../shared/services/ui/color.service";
import { D3Service, D3 } from "d3-ng2-service";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { MappingTreeComponent } from "./mapping.tree.component";

describe("mapping.tree.component.ts", () => {

    let component: MappingTreeComponent;
    let target: ComponentFixture<MappingTreeComponent>;
    let d3: D3;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                D3Service, ColorService, UIService
            ],
            declarations: [MappingTreeComponent]
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
        <g transform="translate(500,500)"></g>
        <g class="node" transform="translate(0,500)">
            <circle class="node" r="10" cursor="pointer" style="fill: #cbe6e1; stroke: #cbe6e1;"></circle>
            <text class="name" dy="1.65em" x="15">My Company</text>
            <text class="accountable" dy="5" x="15"></text>
        </g>
        <g class="node" transform="translate(0,500)">
            <circle class="node" r="10" cursor="pointer" style="fill: #ffffff; stroke: #cccccc;"></circle>
            <text class="name" dy="1.65em" x="15">Tech</text>
            <text class="accountable" dy="5" x="15">CTO</text>
        </g>
        <g class="node" transform="translate(0,500)">
            <circle class="node" r="10" cursor="pointer" style="fill:#ffffff; stroke: #cccccc;"></circle>
            <text class="name" dy="1.65em" x="15">Marketing</text><text class="accountable" dy="5" x="15">CMO</text>
        </g>
    </svg>
*/

    it("should draw SVG with correct size when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));
        component.draw(data);
        let svg = document.getElementsByTagName("svg")
        expect(svg.length).toBe(1);
        expect(svg.item(0).viewBox.baseVal.width).toBe(1522);
        expect(svg.item(0).viewBox.baseVal.height).toBe(1522); // these are harcoded for now
        expect(svg.item(0).getAttribute("width")).toBe("100%");
    });

    it("should draw SVG centered when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));

        component.draw(data);
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);

        expect(svg.querySelector("g")).toBeDefined();
        expect(svg.querySelector("g").transform.baseVal.getItem(0).type).toBe(SVGTransform.SVG_TRANSFORM_TRANSLATE);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.e).toBe(500);
        expect(svg.querySelector("g").transform.baseVal.getItem(0).matrix.f).toBe(500);
    });

    it("should draw SVG with correct number of links when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));

        component.draw(data);
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);
        let paths = svg.querySelectorAll("path.link");
        expect(paths.length).toBe(2);
    });

    it("should draw SVG with correct number of nodes when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));

        component.draw(data);
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let svg = svgs.item(0);
        let nodes = svg.querySelectorAll("g.node");
        expect(nodes.length).toBe(3);
    });

    it("should draw SVG with correct text labels  when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));

        component.draw(data);
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


    it("should draw empty svg when data is undefined", () => {
        let spy = spyOn(component.uiService, "clean");
        component.draw(undefined);
        let svgs = document.getElementsByTagName("svg");
        expect(svgs.length).toBe(1);
        expect(svgs.item(0).hasChildNodes()).toBe(false);
        expect(spy).toHaveBeenCalled();
    })

});
