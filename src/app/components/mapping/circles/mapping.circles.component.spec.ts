import { UIService } from './../../../shared/services/ui.service';
import { ColorService } from './../../../shared/services/color.service';
import { D3Service, D3 } from 'd3-ng2-service';
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { MappingCirclesComponent } from "./mapping.circles.component";

fdescribe("mapping.circles.component.ts", () => {

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
        target.detectChanges(); // trigger initial data binding
    });

    beforeAll(() => {
        fixture.setBase("src/app/components/mapping/circles/fixtures");
    });

    afterEach(() => {
        fixture.cleanup();
    })

    it("should draws SVG with correct size when data is valid", () => {
        let data = fixture.load("data.json");
        component.draw(data);
        let svg = document.getElementsByTagName("svg")
        expect(svg.length).toBe(1);
        expect(svg.item(0).viewBox.baseVal.width).toBe(1522);
        expect(svg.item(0).viewBox.baseVal.height).toBe(1522);
        expect(svg.item(0).getAttribute("width")).toBe("100%");
    })

});
