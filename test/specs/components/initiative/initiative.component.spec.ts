import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core'
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { InitiativeComponent } from '../../../../app/components/initiative/initiative.component';
import { Initiative } from '../../../../app/model/initiative.data';
import { Team } from '../../../../app/model/team.data';
import { Person } from '../../../../app/model/person.data';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('initiative.component.ts', () => {

    let component: InitiativeComponent;
    let target: ComponentFixture<InitiativeComponent>;
    let de: DebugElement;
    let el: HTMLElement;
    let inputNode: Initiative;
    let inputTeam: Team;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [Ng2Bs3ModalModule, NgbModule.forRoot(), FormsModule],
            declarations: [InitiativeComponent]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(InitiativeComponent);
        component = target.componentInstance;
        de = target.debugElement.query(By.css('modal'));
        el = de.nativeElement;


        inputNode = {
            id: 1, name: "ORIGINAL", description: "ORIGINAL", children: [], start: new Date(2010, 1, 1), accountable: <Person>{ name: "ORIGINAL" },
            hasFocus: false, isZoomedOn: false, isSearchedFor: false, search: undefined, traverse: undefined, deserialize: undefined
        };

        component.data = inputNode;
        inputTeam = new Team([]);
        component.team = inputTeam;

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

    it("saves the name when changed", () => {
        expect(component.data.name).toBe("ORIGINAL");
        let element = target.debugElement.query(By.css('#inputName'));
        (element.nativeElement as HTMLInputElement).value = "CHANGED";
        (element.nativeElement as HTMLInputElement).dispatchEvent(new Event('input'))
        expect(component.data.name).toBe("CHANGED");
    });

    it("saves the description as markdown when changed", () => {
        expect(component.data.description).toBe("ORIGINAL");
        let element = target.debugElement.query(By.css('#inputDescription'));
        (element.nativeElement as HTMLTextAreaElement).value = "CHANGED";
        (element.nativeElement as HTMLElement).dispatchEvent(new Event('input'))

        expect((element.nativeElement as HTMLElement).dataset["provide"]).toBe("markdown");
        expect(component.data.description).toBe("CHANGED");
    });

    it("saves the date when changed with a valid date", () => {
        expect(component.data.start.getFullYear()).toBe(2010);
        expect(component.data.start.getMonth()).toBe(1);
        expect(component.data.start.getDate()).toBe(1);
        let element = target.debugElement.query(By.css('#inputDate'));
        (element.nativeElement as HTMLInputElement).value = "2017-01-01";
        (element.nativeElement as HTMLInputElement).dispatchEvent(new Event('input'));
        expect(component.data.start.getFullYear()).toBe(2017);
        expect(component.data.start.getMonth()).toBe(1);
        expect(component.data.start.getDate()).toBe(1);
        expect(component.data.start.getHours()).toBe(0);
        expect(component.data.start.getMinutes()).toBe(0);
        expect(component.data.start.getSeconds()).toBe(0);
    });

    it("does not save the date when changed with an invalid date", () => {
        expect(component.data.start.getFullYear()).toBe(2010);
        expect(component.data.start.getMonth()).toBe(1);
        expect(component.data.start.getDate()).toBe(1);
        let element = target.debugElement.query(By.css('#inputDate'));
        (element.nativeElement as HTMLInputElement).value = "not a date";
        (element.nativeElement as HTMLInputElement).dispatchEvent(new Event('input'));
        expect(component.data.start.getFullYear()).toBe(2010);
        expect(component.data.start.getMonth()).toBe(1);
        expect(component.data.start.getDate()).toBe(1);
        expect(component.data.start.getHours()).toBe(0);
        expect(component.data.start.getMinutes()).toBe(0);
        expect(component.data.start.getSeconds()).toBe(0);
    });

    it("saves the accountable person", () => {
        let element = target.debugElement.query(By.css('#inputAccountable'));
        (element.nativeElement as HTMLInputElement).value = JSON.stringify({ name: "John Doe" });
        (element.nativeElement as HTMLInputElement).dispatchEvent(new Event('input'));
        expect(component.data.accountable.name).toBe("John Doe");
    });




    // it("formats team member value to return name only", () => {
    //     let person = new Person("John Doe");
    //     let actual = target.componentInstance.formatter(person);
    //     expect(actual).toBe("John Doe");
    // });

});
