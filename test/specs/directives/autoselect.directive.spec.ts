import { Component } from '@angular/core'

@Component({
    template: `
 <div>
  <input placeholder="Some text" value="abcd"/>
  <input autoselect placeholder="Should autoselect" value="abcd"/>
  </div>`
})
class TestComponent { }

/********************************
 * 
 */

import { TestBed, ComponentFixture } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { DebugElement, ElementRef } from '@angular/core'
import { AutoSelectDirective } from '../../../app/shared/directives/autoselect.directive'
import * as triggerHelper from '../shared/events.helper';

describe('autoselect.directive.ts', () => {

    let target: ComponentFixture<TestComponent>;
    let autoselectElements: Array<DebugElement>;
    let nonAutoselectElements: Array<DebugElement>;

    beforeEach(() => {
        target = TestBed.configureTestingModule({
            declarations: [AutoSelectDirective, TestComponent]
        })
            .createComponent(TestComponent);

        target.detectChanges(); // initial binding

        autoselectElements = target.debugElement.queryAll(By.directive(AutoSelectDirective));
        nonAutoselectElements = target.debugElement.queryAll(By.css('input:not([autoselect])'));
    });

    it('should have one autoselect elements', () => {
        expect(autoselectElements.length).toBe(1);
    });

    it('should have one non autoselect elements', () => {
        expect(nonAutoselectElements.length).toBe(1);
    });

     it('non autoselect elements do not have a custom property', () => {
       expect(nonAutoselectElements[0].properties['customProperty']).toBeUndefined();
    });
    
    it('on left click, should select the text in the autoselect element', () => {
        triggerHelper.click(autoselectElements[0], triggerHelper.ButtonClickEvents.left);
        let start = (<ElementRef>autoselectElements[0]).nativeElement.selectionStart;
        let end = (<ElementRef>autoselectElements[0]).nativeElement.selectionEnd;
        expect(start).toBe(0);
        expect(end).toBe(4);
    });

    it('on left click, should not select the text in the neutral element', () => {
        triggerHelper.click(nonAutoselectElements[0], triggerHelper.ButtonClickEvents.left);
        let start = (<ElementRef>nonAutoselectElements[0]).nativeElement.selectionStart;
        let end = (<ElementRef>nonAutoselectElements[0]).nativeElement.selectionEnd;
        expect(start).toBe(0);
        expect(end).toBe(0);
    });


});