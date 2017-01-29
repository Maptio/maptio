import { Component , ViewChild, ComponentFactoryResolver} from '@angular/core'
import { AnchorDirective } from '../../../app/directives/anchor.directive'

@Component({
    template: `
     <div id="control"></div>
    <div anchor id="experiment"></div>
  `
})
class TestComponent {
    constructor(public componentFactoryResolver:ComponentFactoryResolver){}
    @ViewChild(AnchorDirective) anchorComponent: AnchorDirective;

 }

interface IAnchorableElement{}

class FirstTypeOfAnchorableElement implements IAnchorableElement{}

/********************************
 * 
 */

import { TestBed, ComponentFixture } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { DebugElement, ElementRef} from '@angular/core'

describe('anchor.directive.ts', () => {

    let target: ComponentFixture<TestComponent>;
    let elements: Array<DebugElement>;
    let otherElements: Array<DebugElement>;

    beforeEach(() => {
        target = TestBed.configureTestingModule({
            declarations: [AnchorDirective, TestComponent]
        })
            .createComponent(TestComponent);

        target.detectChanges(); // initial binding

        elements = target.debugElement.queryAll(By.directive(AnchorDirective));
        otherElements = target.debugElement.queryAll(By.css(':not([anchor])'));

    });

    // it('should have one anchor elements', () => {
    //     expect(elements.length).toBe(1);
        
    // });

    // it('should have one other elements', () => {
    //     expect(otherElements.length).toBe(1);
    // });


    // it('should create children components', () => {
    //     let factory = target.componentInstance.componentFactoryResolver.resolveComponentFactory(FirstTypeOfAnchorableElement);
    //     let actual = target.componentInstance.anchorComponent.createComponent<IAnchorableElement>(factory);

    //     expect(actual).toBeDefined();
        
    // });



});