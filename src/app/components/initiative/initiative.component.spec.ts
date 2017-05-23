import { RouterTestingModule } from '@angular/router/testing';
import { Team } from "./../../shared/model/team.data";
import { ErrorService } from "./../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { TeamFactory } from "./../../shared/services/team.factory";
import { User } from "./../../shared/model/user.data";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { DebugElement } from "@angular/core"
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { InitiativeComponent } from "./initiative.component";
import { Initiative } from "../../shared/model/initiative.data";
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
            imports: [Ng2Bs3ModalModule, NgbModule.forRoot(), FormsModule, RouterTestingModule],
            declarations: [InitiativeComponent],
            providers: [TeamFactory,
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService
            ]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(InitiativeComponent);
        component = target.componentInstance;
        de = target.debugElement.query(By.css("modal"));
        el = de.nativeElement;


        inputNode = {
            id: 1, name: "ORIGINAL", description: "ORIGINAL", children: [], helpers: [], start: new Date(2010, 1, 1), accountable: <User>{ name: "ORIGINAL" },
            hasFocus: false, isZoomedOn: false, team_id: "team_id", isSearchedFor: false, search: undefined, traverse: undefined, deserialize: undefined, tryDeserialize: undefined,
            getSlug: undefined, getParent:undefined
        };

        component.initiative = inputNode;
        inputTeam = new Team([]);
        component.team = inputTeam;

        target.detectChanges(); // trigger initial data binding
    });

    describe("Controller", () => {
        it("should open modal and assign team", () => {
            let mockTeam = new Team({ members: [new User({ name: "John Doe" })] });
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let spyGetTeam = spyOn(mockTeamFactory, "get").and.returnValue(Promise.resolve<Team>(mockTeam))

            spyOn(component.modal, "open");
            component.open();
            expect(spyGetTeam).toHaveBeenCalled();
            spyGetTeam.calls.mostRecent().returnValue.then((team: Team) => {
                expect(component.team).toBe(mockTeam)
            })

            expect(component.modal).toBeDefined();
            expect(component.modal.open).toHaveBeenCalled();
        });

        describe("saveName", () => {
            it("should save a new name", () => {
                expect(component.initiative.name).toBe("ORIGINAL");
                component.saveName("CHANGED");
                expect(component.initiative.name).toBe("CHANGED");
            });
        });

        describe("saveDescription", () => {
            it("should save a new description", () => {
                expect(component.initiative.description).toBe("ORIGINAL");
                component.saveDescription("CHANGED");
                expect(component.initiative.description).toBe("CHANGED");
            });
        });

        describe("saveStartDate", () => {
            it("should save a new date when given date is valid", () => {
                expect(component.initiative.start.getFullYear()).toBe(2010);
                expect(component.initiative.start.getMonth()).toBe(1);
                expect(component.initiative.start.getDate()).toBe(1);
                component.saveStartDate("2017-01-01");
                expect(component.initiative.start.getFullYear()).toBe(2017);
                expect(component.initiative.start.getMonth()).toBe(1);
                expect(component.initiative.start.getDate()).toBe(1);
                expect(component.initiative.start.getHours()).toBe(0);
                expect(component.initiative.start.getMinutes()).toBe(0);
                expect(component.initiative.start.getSeconds()).toBe(0);
            });

            it("should not save the date when given date is invalid", () => {
                expect(component.initiative.start.getFullYear()).toBe(2010);
                expect(component.initiative.start.getMonth()).toBe(1);
                expect(component.initiative.start.getDate()).toBe(1);
                component.saveStartDate("this is not a valid date");
                expect(component.initiative.start.getFullYear()).toBe(2010);
                expect(component.initiative.start.getMonth()).toBe(1);
                expect(component.initiative.start.getDate()).toBe(1);
                expect(component.initiative.start.getHours()).toBe(0);
                expect(component.initiative.start.getMinutes()).toBe(0);
                expect(component.initiative.start.getSeconds()).toBe(0);
            });
        });

        describe("saveAccountable", () => {
            it("should save accountable person when valid person is given", () => {
                expect(component.initiative.accountable).toBeDefined();
                expect(component.initiative.accountable.name).toBe("ORIGINAL");
                component.saveAccountable({ item: new User({ name: "John Doe" }), preventDefault: null });
                expect(component.initiative.accountable.name).toBe("John Doe");
            });
        });

        describe("addHelper", () => {
            it("should add helper to the list when checked is true", () => {
                let helpers = [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })];
                component.initiative.helpers = helpers;
                expect(component.initiative.helpers.length).toBe(3);
                component.addHelper(new User({ user_id: "4" }), true)
                expect(component.initiative.helpers.length).toBe(4);
                expect(component.initiative.helpers.find(h => h.user_id === "4")).toBeDefined();
            })

            it("should remove helper from the list when checked is false", () => {
                let helpers = [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })];
                component.initiative.helpers = helpers;
                expect(component.initiative.helpers.length).toBe(3);
                component.addHelper(new User({ user_id: "3" }), false)
                expect(component.initiative.helpers.length).toBe(2);
                expect(component.initiative.helpers.find(h => h.user_id === "3")).toBeUndefined();
            })
        });

        describe("isHelper", () => {

            it("shoud return  false if user is not defined by its user_id", () => {
                let helpers = [new User({ name: "1" }), new User({ name: "2" }), new User({ name: "3" })];
                component.initiative.helpers = helpers;
                let actual = component.isHelper(new User({ name: "4" }))
                expect(actual).toBe(false);
            });

            it("shoud return   false if user is not in the list of helpers", () => {
                let helpers = [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })];
                component.initiative.helpers = helpers;
                let actual = component.isHelper(new User({ user_id: "4" }))
                expect(actual).toBe(false);
            });

            it("should return true if the user is in the list of helpers", () => {
                let helpers = [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })];
                component.initiative.helpers = helpers;
                let actual = component.isHelper(new User({ user_id: "1" }))
                expect(actual).toBe(true);
            });

            it("should return false if the list of helpers is empty", () => {
                let helpers = undefined
                component.initiative.helpers = helpers;
                let actual = component.isHelper(new User({ user_id: "1" }))
                expect(actual).toBe(false);
            });

            it("should return false if the initiative is not loaded", () => {
                component.initiative = undefined
                let actual = component.isHelper(new User({ user_id: "1" }))
                expect(actual).toBe(false);
            })

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

        it("saves the accountable person", () => {
            let spySaveAccountable = spyOn(component, "saveAccountable");
            let element = target.debugElement.query(By.css("#inputAccountable"));
            (element.nativeElement as HTMLInputElement).value = JSON.stringify({ item: new User({ name: "John Doe" }) });
            (element.nativeElement as HTMLInputElement).dispatchEvent(new CustomEvent("selectItem"));
            // FIXME : Check the saveAccountable arguments but how ? 
            expect(spySaveAccountable).toHaveBeenCalled(); //With(jasmine.objectContaining({item : new User({ name: "John Doe" })}));
        });

        describe("Helpers", () => {
            it("should call addHelper when checking the helpers box", () => {
                let spyAddHelper = spyOn(component, "addHelper");
                let list = [new User({ user_id: "1", name: "One" }), new User({ user_id: "2", name: "Two" }), new User({ user_id: "3", name: "Three" })];
                component.initiative.helpers = list.slice(0, 2);
                component.team = new Team({ name: "Team", members: list });
                target.detectChanges();

                let helpersElements = target.debugElement.queryAll(By.css(".inputHelper"));
                expect(helpersElements.length).toBe(3);
                (helpersElements[1].nativeElement as HTMLInputElement).checked = true;
                (helpersElements[1].nativeElement as HTMLInputElement).dispatchEvent(new Event("click"))
                expect(spyAddHelper).toHaveBeenCalledWith(new User({ user_id: "2", name: "Two" }), true);

            });

            it("should call addHelper when unchecking the helpers box", () => {
                let spyAddHelper = spyOn(component, "addHelper");
                let list = [new User({ user_id: "1", name: "One" }), new User({ user_id: "2", name: "Two" }), new User({ user_id: "3", name: "Three" })];
                component.initiative.helpers = list.slice(0, 2);
                component.team = new Team({ name: "Team", members: list });
                target.detectChanges();

                let helpersElements = target.debugElement.queryAll(By.css(".inputHelper"));
                expect(helpersElements.length).toBe(3);
                (helpersElements[1].nativeElement as HTMLInputElement).checked = false;
                (helpersElements[1].nativeElement as HTMLInputElement).dispatchEvent(new Event("click"))
                expect(spyAddHelper).toHaveBeenCalledWith(new User({ user_id: "2", name: "Two" }), false);
            });

            it("should bind checked with isHelper", () => {
                let spyIsHelper = spyOn(component, "isHelper");
                let list = [new User({ user_id: "1", name: "One" }), new User({ user_id: "2", name: "Two" }), new User({ user_id: "3", name: "Three" })];
                component.initiative.helpers = list.slice(0, 2);
                component.team = new Team({ name: "Team", members: list });
                target.detectChanges();
                expect(spyIsHelper).toHaveBeenCalled()
            })
        })



    });



});
