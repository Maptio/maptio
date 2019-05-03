import { SearchComponent, SearchResultType, SearchResult } from "./search.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { Helper } from "../../../../shared/model/helper.data";
import { Initiative } from "../../../../shared/model/initiative.data";
import { Observable } from "rxjs";
import { AnalyticsModule } from "../../../../core/analytics.module";
import { NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";

describe("search.component.ts", () => {

    let component: SearchComponent;
    let target: ComponentFixture<SearchComponent>;

    let boss = new Helper({ user_id: "boss", name: "Boss" })
    let helper1 = new Helper({ user_id: "helper1", name: "Helper1" })
    let helper2 = new Helper({ user_id: "helper2", name: "Helper2" })


    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [SearchComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, AnalyticsModule, NgbTypeaheadModule]
        }).overrideComponent(SearchComponent, {
            set: {
                // providers: [
                //     Angulartics2Mixpanel
                // ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(SearchComponent);

        component = target.componentInstance;

        
        component.list = [
            new Initiative({ id: 1, name: "One", description: "un", accountable: boss, helpers: [helper1] }),
            new Initiative({ id: 2, name: "Two", description: "deux", accountable: boss, helpers: [helper2] }),
            new Initiative({ id: 3, name: "Three", description: "trois", accountable: boss, helpers: [helper1, helper2] }),
            new Initiative({ id: 4, name: "Four", description: "quatre", helpers: [helper1] }),
            new Initiative({ id: 4, name: "Four", description: "quatre", accountable: boss, helpers: [] }),
        ]
        component.selectedResult = null;
        // target.detectChanges();
    });

    it("shoud format results correctly", () => {
        let r= <SearchResult>({
            type:SearchResultType.Initiative,
            result: component.list[0]
        })
        let actual = component.formatter(r);
        expect(actual).toEqual("One")
    });

    it("should select initiative", () => {
        spyOn(component.selectInitiative, "emit")
        component.select({ item: {type : SearchResultType.Initiative, result: component.list[1]}, preventDefault: null });
        expect(component.isSearching).toBeFalsy();
        expect(component.selectInitiative.emit).toHaveBeenCalledWith(component.list[1])
    });

    describe("Filter", () => {
        it("should return correct results when searching name", () => {
            let term = "one"
            let actual = component.findInitiatives(term);
            expect(actual.length).toBe(1)
            expect(actual[0].type).toEqual(SearchResultType.Initiative)
            expect(actual[0].result).toEqual(component.list[0])
        });

        it("should return correct results when searching description", () => {
            let term = "deux"
            let actual = component.findInitiatives(term);
            expect(actual.length).toBe(1)
            expect(actual[0].type).toEqual(SearchResultType.Initiative)
            expect(actual[0].result).toEqual(component.list[1])
        });

        it("should return correct results when searching person", () => {
            let term = "boss"
            let actual = component.findUsers(term);
            expect(actual.length).toBe(1);
            expect(actual[0].type).toEqual(SearchResultType.User)
            expect(actual[0].result.name).toEqual(boss.name)
        });

        it("should return correct results when searching person", () => {
            let term = "helper"
            let actual = component.findUsers(term);
            expect(actual.length).toBe(2)
            expect(actual[0].type).toEqual(SearchResultType.User)
            expect(actual[0].result.name).toEqual(helper1.name)
            expect(actual[1].type).toEqual(SearchResultType.User)
            expect(actual[1].result.name).toEqual(helper2.name)
        });

    });

    describe("Search", () => {
        xit("calls correct dependencies", async(() => {

            let spyObj = {
                debounceTime : jest.fn().mockReturnThis(),
                distinctUntilChanged : jest.fn().mockReturnThis(),
                do : jest.fn().mockReturnThis(),
                map: jest.fn().mockReturnThis()
            } as any;
            
            let spyFilter = jest.spyOn(component, "findInitiatives").and.returnValue([]);
     
            component.search(spyObj);

            expect(spyObj.debounceTime).toHaveBeenCalledWith(200);
            expect(spyObj.distinctUntilChanged).toHaveBeenCalledTimes(1);
            expect(spyObj.do).toHaveBeenCalledTimes(2);

        }));
    });


});