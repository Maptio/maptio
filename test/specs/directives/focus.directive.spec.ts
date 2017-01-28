import { Component } from '@angular/core'

@Component({
    template: `
<h2 id="title" class="title">Just another element </h2>
  <input #box id="box" [focus]="box.value"/>
  `
})
class TestComponent { }

/********************************
 * 
 */

import { TestBed, ComponentFixture } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { DebugElement, ElementRef } from '@angular/core'
import { FocusDirective } from '../../../app/directives/focus.directive'
import * as triggerHelper from '../shared/events.helper';

describe('focus.directive.ts', () => {

    let target: ComponentFixture<TestComponent>;
    let elements: Array<DebugElement>;
    let otherElement: DebugElement;

    beforeEach(() => {
        target = TestBed.configureTestingModule({
            declarations: [FocusDirective, TestComponent]
        })
            .createComponent(TestComponent);

        target.detectChanges(); // initial binding

        elements = target.debugElement.queryAll(By.directive(FocusDirective));
        otherElement = target.debugElement.query(By.css('h2'));

    });

    it('should have one focus elements', () => {
        expect(elements.length).toBe(1);
    });

    it('should have one other elements', () => {
        expect(otherElement).toBeDefined();
    });

    // it('just a test', () => {
    //      otherElement.triggerEventHandler('focus',null);
    //      console.log(document.activeElement.tagName);
    // });

    it('should bind element value to focus', () => {
        //focus on other element first
        (<ElementRef>otherElement).nativeElement.focus();

        // easier to work with nativeElement
        const input = elements[0].nativeElement as HTMLInputElement;
        expect(input.value).toBeFalsy();
      
        // dispatch a DOM event so that Angular responds to the input value change.
        input.value = 'true';
        input.dispatchEvent(new Event('input'));
        target.detectChanges();
      
        expect(document.activeElement.id).toBe("box");
    });

    it('should bind element value to blur', () => {

        //focus on other element first
        otherElement.nativeElement.focus();

        // easier to work with nativeElement
        const input = elements[0].nativeElement as HTMLInputElement;
        expect(input.value).toBeFalsy();

        // dispatch a DOM event so that Angular responds to the input value change.
        input.value = 'false';
        input.dispatchEvent(new Event('input'));
        target.detectChanges();

        expect(document.activeElement.id).toBe("title");
    });



});