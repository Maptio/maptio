import { Component } from '@angular/core'

@Component({
    template: `
    <input id="other" value="Another input"/>
    <input #box id="box" [focusif]="box.value" value="false"/>
  `
})
class TestComponent { }

/********************************
 * 
 */

import { TestBed, ComponentFixture } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { DebugElement, ElementRef } from '@angular/core'
import { FocusIfDirective } from '../../../app/shared/directives/focusif.directive'
import * as triggerHelper from '../shared/events.helper';

describe('focusif.directive.ts', () => {

    let target: ComponentFixture<TestComponent>;
    let elements: Array<DebugElement>;
    let otherElement: DebugElement;

    beforeEach(() => {
        target = TestBed.configureTestingModule({
            declarations: [FocusIfDirective, TestComponent]
        })
            .createComponent(TestComponent);

        target.detectChanges(); // initial binding

        elements = target.debugElement.queryAll(By.directive(FocusIfDirective));
        otherElement = target.debugElement.query(By.css('input:not([focusif])'));

    });

    it('should have one focus elements', () => {
        expect(elements.length).toBe(1);
    });

    it('should have one other elements', () => {
        expect(otherElement).toBeDefined();
    });


    it('should bind element value to focus when [focusif] is true', () => {
        //focus on other element first
        (<ElementRef>otherElement).nativeElement.focus();

        // easier to work with nativeElement
        const input = elements[0].nativeElement as HTMLInputElement;
        expect(input.value).toBe("false");

        // dispatch a DOM event so that Angular responds to the input value change.
        input.value = 'true';
        input.dispatchEvent(new Event('input'));
        target.detectChanges();
        
        expect(document.activeElement.id).toBe("box");
    });

    it('should bind element value to blur when [focusif] is false', () => {

        //focus on other element first
        (<ElementRef>otherElement).nativeElement.focus();

        // easier to work with nativeElement
        const input = elements[0].nativeElement as HTMLInputElement;
        expect(input.value).toBe("false");

        // dispatch a DOM event so that Angular responds to the input value change.
        input.value = 'false';
        input.dispatchEvent(new Event('input'));
        target.detectChanges();
        
        expect(document.activeElement.id).toBe("other");
    });

     it('should bind element value to blur when [focusif] is not a boolean', () => {

        //focus on other element first
        (<ElementRef>otherElement).nativeElement.focus();

        // easier to work with nativeElement
        const input = elements[0].nativeElement as HTMLInputElement;
        expect(input.value).toBe("false");

        // dispatch a DOM event so that Angular responds to the input value change.
        input.value = 'not a boolean';
        input.dispatchEvent(new Event('input'));
        target.detectChanges();
        
        expect(document.activeElement.id).toBe("other");
    });



});