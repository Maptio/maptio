import { Subject, ReplaySubject } from "rxjs/Rx";
import { LoaderService, LoaderState } from "./../../shared/services/loading/loader.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { async, TestBed, ComponentFixture } from "@angular/core/testing";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import { RouterTestingModule } from "@angular/router/testing";
import { Tag, SelectableTag } from "../../shared/model/tag.data";
import { Team } from "../../shared/model/team.data";
import { SearchComponent } from "./search.component";
import { Initiative } from "../../shared/model/initiative.data";
import { Helper } from "../../shared/model/helper.data";


describe("search.component.ts", () => {

    let component: SearchComponent;
    let target: ComponentFixture<SearchComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [SearchComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule]
        }).overrideComponent(SearchComponent, {
            set: {
                providers: [
                    Angulartics2Mixpanel, Angulartics2
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(SearchComponent);

        component = target.componentInstance;

        let boss = new Helper({ user_id: "boss", name: "Boss" })
        let helper1 = new Helper({ user_id: "helper1", name: "Helper1" })
        let helper2 = new Helper({ user_id: "helper2", name: "Helper2" })

        component.list = [
            new Initiative({ id: 1, name: "One", description: "un", accountable: boss, helpers: [helper1] }),
            new Initiative({ id: 2, name: "Two", description: "deux", accountable: boss, helpers: [helper2] }),
            new Initiative({ id: 3, name: "Three", description: "trois", accountable: boss, helpers: [helper1, helper2] }),
            new Initiative({ id: 4, name: "Four", description: "quatre", helpers: [helper1] }),
            new Initiative({ id: 4, name: "Four", description: "quatre", accountable: boss, helpers: [] }),
        ]
        target.detectChanges();
    });

    it("shoud format results correctly", () => {
        let actual = component.formatter(component.list[0]);
        expect(actual).toBe("One")
    });

    it("should select initiative", () => {
        spyOn(component.selectInitiative, "emit")
        component.select({ item: component.list[1], preventDefault: null });
        expect(component.isSearching).toBeFalsy();
        expect(component.selectInitiative.emit).toHaveBeenCalledWith(component.list[1])
    });

    describe("Filter", () => {
        it("should return correct results when searching name", () => {
            let term = "one"
            let actual = component.filter(term);
            expect(actual.length).toBe(1)
            expect(actual[0]).toEqual(component.list[0])
        });

        it("should return correct results when searching description", () => {
            let term = "deux"
            let actual = component.filter(term);
            expect(actual.length).toBe(1)
            expect(actual[0]).toEqual(component.list[1])
        });

        it("should return correct results when searching person", () => {
            let term = "boss"
            let actual = component.filter(term);
            expect(actual.length).toBe(4)
            expect(actual[0]).toEqual(component.list[0])
            expect(actual[1]).toEqual(component.list[1])
            expect(actual[2]).toEqual(component.list[2])
            expect(actual[3]).toEqual(component.list[4])
        });

        it("should return correct results when searching person", () => {
            let term = "helper"
            let actual = component.filter(term);
            expect(actual.length).toBe(4)
            expect(actual[0]).toEqual(component.list[0])
            expect(actual[1]).toEqual(component.list[1])
            expect(actual[2]).toEqual(component.list[2])
            expect(actual[3]).toEqual(component.list[3])
        });

    });


});