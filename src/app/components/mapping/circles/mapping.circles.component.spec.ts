import { Initiative } from "./../../../shared/model/initiative.data";
import { UIService } from "./../../../shared/services/ui.service";
import { ColorService } from "./../../../shared/services/color.service";
import { D3Service, D3 } from "d3-ng2-service";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { MappingCirclesComponent } from "./mapping.circles.component";

describe("mapping.circles.component.ts", () => {

    let component: MappingCirclesComponent;
    let target: ComponentFixture<MappingCirclesComponent>;
    let d3: D3;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                D3Service, ColorService, UIService
            ],
            declarations: [MappingCirclesComponent]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingCirclesComponent);
        component = target.componentInstance;
        d3 = component.d3Service.getD3();

        component.width = 1000;
        component.height = 1000;
        component.margin = 50;

        target.detectChanges(); // trigger initial data binding
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/mapping/circles/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });

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

    it("should draw SVG with correct number of circles when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));

        component.draw(data);
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelectorAll("circle.node.node--root").length).toBe(1);
        expect(g.querySelectorAll("circle.node.node--leaf").length).toBe(2);
    });

    it("should draw SVG with correct text labels  when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));

        component.draw(data);
        let svgs = document.getElementsByTagName("svg")
        expect(svgs.length).toBe(1);
        let g = svgs.item(0).querySelector("g");
        expect(g.querySelector("text#title0").textContent).toBe("My Company");
        expect(g.querySelector("text#title1").textContent).toBe("Tech");
        expect(g.querySelector("text#title2").textContent).toBe("Marketing")
    });

    it("should calculate paths when data is valid", () => {
        let data = new Initiative().deserialize(fixture.load("data.json"));
        let spy = spyOn(component.uiService, "getCircularPath");
        component.draw(data);

        expect(spy).toHaveBeenCalledTimes(3);
        let svg = document.getElementsByTagName("svg").item(0)
        expect(svg.querySelector("defs")).toBeDefined();
        let defs = svg.querySelector("defs");
        expect(defs.querySelectorAll("path").length).toBe(3);
        expect(defs.querySelectorAll("path#path0")).toBeDefined();
        expect(defs.querySelectorAll("path#path1")).toBeDefined();
        expect(defs.querySelectorAll("path#path2")).toBeDefined();
    });

    it("should not draw empty svg when data is undefined", () => {
        let spy = spyOn(component.uiService, "clean");
        component.draw(undefined);
        let svgs = document.getElementsByTagName("svg");
        expect(svgs.length).toBe(1); 
        expect(svgs.item(0).hasChildNodes()).toBe(false);
        expect(spy).toHaveBeenCalled();
    })

});
