import { Component, ViewChild, ComponentFactoryResolver } from "@angular/core"
import { AnchorDirective } from "../../../app/shared/directives/anchor.directive"
import { AnAnchorableComponent, IAnchorableComponent } from "../shared/component.helper.shared"
import { TestBed, ComponentFixture } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { DebugElement } from "@angular/core"

@Component({
    template: `
     <div id="control"></div>
    <div anchor id="experiment"></div>
  `
})
class TestComponent {
    constructor(public componentFactoryResolver: ComponentFactoryResolver) { }
    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;
    @ViewChild(AnAnchorableComponent) childComponent: AnAnchorableComponent;
}

describe("anchor.directive.ts", () => {

    let target: ComponentFixture<TestComponent>;
    let elements: Array<DebugElement>;
    let otherElements: Array<DebugElement>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AnchorDirective, AnAnchorableComponent, TestComponent],
        })
            .compileComponents();
    });

    beforeEach(() => {

        target = TestBed.createComponent(TestComponent);

        target.detectChanges(); // initial binding

        elements = target.debugElement.queryAll(By.directive(AnchorDirective));
        otherElements = target.debugElement.queryAll(By.css(":not([anchor])"));

    });

    it("should have one anchor elements", () => {
        expect(elements.length).toBe(1);

    });

    it("should have one other elements", () => {
        expect(otherElements.length).toBe(1);
    });


    // it('should create children components', () => {
    //     let factory = target.componentInstance.componentFactoryResolver.resolveComponentFactory(AnAnchorableComponent);
    //     console.log(factory)
    //     let actual = target.componentInstance.anchorComponent.createComponent<IAnchorableComponent>(factory);

    //     expect(actual).toBeDefined();

    // });



});