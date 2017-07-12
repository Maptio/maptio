import { Observable } from 'rxjs/Rx';
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TooltipComponent } from "./../tooltip/tooltip.component";
import { Initiative } from "./../../../shared/model/initiative.data";
import { UIService } from "./../../../shared/services/ui/ui.service";
import { ColorService } from "./../../../shared/services/ui/color.service";
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
            declarations: [MappingCirclesComponent, TooltipComponent],
            schemas: [NO_ERRORS_SCHEMA]
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
        component.zoom$ = Observable.of(1);

        target.detectChanges(); // trigger initial data binding
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/mapping/circles/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    });

    /*
    <svg _ngcontent-a-4="" viewBox="0 0 1522 1522" width="100%" style="background-color: rgb(252, 252, 252); background-position: initial initial;
 background-repeat: initial initial;">
    <g transform="translate(500,500)">
        <circle class="node node--root" id="circle0" style="fill: #cbe6e1; stroke:none;" transform="translate(0,0)" r="475"></circle>
        <circle class="node node--leaf" id="circle1" style="fill: #ffffff; stroke: none;" transform="translate(-232.7970297029703,0)" r="223.39108910891088"></circle>
        <circle class="node node--leaf" id="circle2" style="fill: #ffffff; stroke: none;" transform="translate(232.79702970297035,0)" r="223.39108910891088"></circle>

        <text id="title0" font-size="1em" transform="translate(0,0)" style="display: none;">
            <textpath href="#path0" startOffset="10%">My Company</textpath>
        </text>
        <text transform="translate(-232.7970297029703,0)"></text>
        <text transform="translate(232.79702970297035,0)"></text>
        <text transform="translate(0,0)"></text>
        <text font-size="0.8em" id="title1" dy="0" x="-189.88242574257424" y="-22.33910891089109" transform="translate(-232.7970297029703,0)">
            <tspan x="-189.88242574257424" y="-22.33910891089109" dy="0em">Tech</tspan>
        </text>
        <text font-size="0.8em" id="title2" dy="0" x="-189.88242574257424" y="-22.33910891089109" transform="translate(232.79702970297035,0)">
            <tspan x="-189.88242574257424" y="-22.33910891089109" dy="0em">Marketing</tspan>
        </text>
        <text transform="translate(0,0)"></text><text transform="translate(-232.7970297029703,0)"></text>
        <text transform="translate(232.79702970297035,0)"></text>

        <g class="hidden" id="description-group0">
            <circle class="description" transform="translate(0,0)" r="475" style="fill: #cbe6e1;"></circle>
            <text class="description" id="description-content0" dy="0" x="0" y="0" transform="translate(0,0)">
                <tspan x="0" y="0" dy="0em"></tspan>
            </text>
        </g>
        <g class="hidden" id="description-group1">
            <circle class="description" transform="translate(-232.7970297029703,0)" r="223.39108910891088" style="fill: #ffffff;"></circle>
            <text class="description" id="description-content1" dy="0" x="0" y="0" transform="translate(-232.7970297029703,0)">
                <tspan x="0" y="0" dy="0em"></tspan>
            </text>
        </g>

        <g class="hidden" id="description-group2">
            <circle class="description" transform="translate(232.79702970297035,0)" r="223.39108910891088" style="fill: #ffffff;"></circle>
            <text class="description" id="description-content2" dy="0" x="0" y="0" transform="translate(232.79702970297035,0)">
                <tspan x="0" y="0" dy="0em"></tspan>
            </text>
        </g>
    </g>

    <defs>
        <path id="path0" d="m -478, 0 a -478,-478 1 1,1 956,0 a -478,-478 1 1,1 -956,0"></path>
        <path id="path1" d="m -226.39108910891088, 0a -226.39108910891088,-226.39108910891088 1 1,1 452.78217821782175,0 a -226.39108910891088,-226.39108910891088 1 1,1 -452.78217821782175,0"></path>
        <path id="path2" d="m -226.39108910891088, 0 a -226.39108910891088,-226.39108910891088 1 1,1 452.78217821782175,0 a -226.39108910891088,-226.39108910891088 1 1,1 -452.78217821782175,0"></path>
    </defs>
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
        expect(g.querySelector("text#title0")).toBe(null); // do not dusplay map name
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

    it("should draw empty svg when data is undefined", () => {
        let spy = spyOn(component.uiService, "clean");
        component.draw(undefined);
        let svgs = document.getElementsByTagName("svg");
        expect(svgs.length).toBe(1);
        expect(svgs.item(0).hasChildNodes()).toBe(false);
        expect(spy).toHaveBeenCalled();
    })

});
