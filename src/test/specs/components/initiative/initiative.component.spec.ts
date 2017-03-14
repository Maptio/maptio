import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core'
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { InitiativeComponent } from "../../../../app/components/initiative/initiative.component";
import { Initiative } from "../../../../app/shared/model/initiative.data";
import { Team } from "../../../../app/shared/model/team.data";
import { Person } from "../../../../app/shared/model/person.data";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

describe("initiative.component.ts", () => {

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
        de = target.debugElement.query(By.css("modal"));
        el = de.nativeElement;


        inputNode = {
            id: 1, name: "ORIGINAL", description: "ORIGINAL", children: [], start: new Date(2010, 1, 1), accountable: <Person>{ name: "ORIGINAL" },
            hasFocus: false, isZoomedOn: false, isSearchedFor: false, search: undefined, traverse: undefined, deserialize: undefined, tryDeserialize:undefined
        };

        component.data = inputNode;
        inputTeam = new Team([]);
        component.team = inputTeam;

        target.detectChanges(); // trigger initial data binding
    });

    describe("Controller", () => {
        it("should open modal", () => {
            spyOn(component.modal, "open");
            component.open();
            expect(component.modal).toBeDefined();
            expect(component.modal.open).toHaveBeenCalled();
        });

        describe("saveName", () => {
            it("should save a new name", () => {
                expect(component.data.name).toBe("ORIGINAL");
                component.saveName("CHANGED");
                expect(component.data.name).toBe("CHANGED");
            });
        });

        describe("saveDescription", () => {
            it("should save a new description", () => {
                expect(component.data.description).toBe("ORIGINAL");
                component.saveDescription("CHANGED");
                expect(component.data.description).toBe("CHANGED");
            });
        });

        describe("saveStartDate", () => {
            it("should save a new date when given date is valid", () => {
                expect(component.data.start.getFullYear()).toBe(2010);
                expect(component.data.start.getMonth()).toBe(1);
                expect(component.data.start.getDate()).toBe(1);
                component.saveStartDate("2017-01-01");
                expect(component.data.start.getFullYear()).toBe(2017);
                expect(component.data.start.getMonth()).toBe(1);
                expect(component.data.start.getDate()).toBe(1);
                expect(component.data.start.getHours()).toBe(0);
                expect(component.data.start.getMinutes()).toBe(0);
                expect(component.data.start.getSeconds()).toBe(0);
            });

            it("should not save the date when given date is invalid", () => {
                expect(component.data.start.getFullYear()).toBe(2010);
                expect(component.data.start.getMonth()).toBe(1);
                expect(component.data.start.getDate()).toBe(1);
                component.saveStartDate("this is not a valid date");
                expect(component.data.start.getFullYear()).toBe(2010);
                expect(component.data.start.getMonth()).toBe(1);
                expect(component.data.start.getDate()).toBe(1);
                expect(component.data.start.getHours()).toBe(0);
                expect(component.data.start.getMinutes()).toBe(0);
                expect(component.data.start.getSeconds()).toBe(0);
            });
        });

        describe("saveAccountable", () => {
            it("should save accountable person when valid person is given", () => {
                expect(component.data.accountable).toBeDefined();
                expect(component.data.accountable.name).toBe("ORIGINAL");
                component.saveAccountable(JSON.stringify({ name: "John Doe" }));
                expect(component.data.accountable.name).toBe("John Doe");
            });

             it("should not save accountable person when invalid person is given", () => {
                expect(component.data.accountable).toBeDefined();
                expect(component.data.accountable.name).toBe("ORIGINAL");
                component.saveAccountable(JSON.stringify({ notanameattribute: "John Doe" }));
                expect(component.data.accountable.name).toBe("ORIGINAL");
            });
        });
    });

    describe("View", () => {
        it("should create modal with the right settings", () => {
            let modal = target.debugElement.query(By.css("modal"));
            expect(modal.attributes["data-keyboard"]).toBe("true");
            expect(modal.attributes["data-backdrop"]).toBe("true");
        });

        it("should open modal", () => {
            spyOn(component.modal, "open");
            component.open();
            expect(document.querySelectorAll(".modal").length).toBe(1);
        });

        it("should call saveName when changed name is changed", () => {
            let spySaveName = spyOn(component, "saveName");
            let element = target.debugElement.query(By.css("#inputName"));
            (element.nativeElement as HTMLInputElement).value = "CHANGED";
            (element.nativeElement as HTMLInputElement).dispatchEvent(new Event("input"))
            expect(spySaveName).toHaveBeenCalledWith("CHANGED");
        });

        it("should call saveDescription when description is changed", () => {
            let spySaveDescription = spyOn(component, "saveDescription");
            let element = target.debugElement.query(By.css("#inputDescription"));
            (element.nativeElement as HTMLTextAreaElement).value = "CHANGED";
            (element.nativeElement as HTMLElement).dispatchEvent(new Event("input"))

            expect((element.nativeElement as HTMLElement).dataset["provide"]).toBe("markdown");
            expect(spySaveDescription).toHaveBeenCalledWith("CHANGED");
        });

        it("should call saveStartDate when date is changed", () => {
            let spySaveDate = spyOn(component, "saveStartDate");
            expect(component.data.start.getFullYear()).toBe(2010);
            expect(component.data.start.getMonth()).toBe(1);
            expect(component.data.start.getDate()).toBe(1);
            let element = target.debugElement.query(By.css("#inputDate"));
            (element.nativeElement as HTMLInputElement).value = "2017-01-01";
            (element.nativeElement as HTMLInputElement).dispatchEvent(new Event("input"));
            expect(spySaveDate).toHaveBeenCalledWith("2017-01-01");
        });

        it("saves the accountable person", () => {
            let spySaveAccountable = spyOn(component, "saveAccountable");
            let element = target.debugElement.query(By.css("#inputAccountable"));
            (element.nativeElement as HTMLInputElement).value = JSON.stringify({ name: "John Doe" });
            (element.nativeElement as HTMLInputElement).dispatchEvent(new Event("input"));
            expect(spySaveAccountable).toHaveBeenCalledWith(JSON.stringify({ name: "John Doe" }));
        });

    });



});
