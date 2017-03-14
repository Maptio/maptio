import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core'
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HelpComponent } from '../../../../app/components/help/help.component';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

describe('help.component.ts', () => {

    let component: HelpComponent;
    let target: ComponentFixture<HelpComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [Ng2Bs3ModalModule, FormsModule],
            declarations: [HelpComponent]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(HelpComponent);
        component = target.componentInstance;
        de = target.debugElement.query(By.css('modal'));
        el = de.nativeElement;

        target.detectChanges(); // trigger initial data binding
    });

    it('should create modal with the right settings', () => {
        let modal = target.debugElement.query(By.css('modal'));
        expect(modal.attributes["data-keyboard"]).toBe("true");
        expect(modal.attributes["data-backdrop"]).toBe("true");
    });

    it('should open modal', () => {
        spyOn(target.componentInstance.modal, "open");
        target.componentInstance.open();
        expect(target.componentInstance.modal).toBeDefined();
        expect(target.componentInstance.modal.open).toHaveBeenCalled();
        expect(document.querySelectorAll('.modal').length).toBe(1);

    });

});
