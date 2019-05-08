import { Initiative } from "../../../../shared/model/initiative.data";
import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild } from "@angular/core";

import { NgbTypeaheadSelectItemEvent, NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs/Observable";
import { User } from "../../../../shared/model/user.data";
import { flatten, uniqBy } from "lodash-es"

export enum SearchResultType {
    Initiative,
    User,
}

export class SearchResult {
    type: SearchResultType
    result: User | Initiative
    header?: string
}

@Component({
    selector: "search",
    templateUrl: "./search.component.html",
    styleUrls: ["./search.component.css"]
})
export class SearchComponent implements OnInit {
    @Input() list: Initiative[];
    @Input() selectedResult: SearchResult;
    @Output() selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();
    @Output() selectUser: EventEmitter<User> = new EventEmitter<User>();
    @Output() clear: EventEmitter<void> = new EventEmitter<void>();

    constructor(private cd: ChangeDetectorRef) { }

    public searchResultsCount: number;
    public isSearching: boolean;
    public isFocus: boolean;

    @ViewChild("initiativeSearch") public typeahead: NgbTypeahead;

    SearchResultType = SearchResultType;

    ngOnInit() { }

    findInitiatives(term: string): SearchResult[] {
        return this.list
            .filter(
                v =>
                    v.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                    (v.description &&
                        v.description.toLowerCase().indexOf(term.toLowerCase()) >
                        -1) ||
                    (v.accountable &&
                        v.accountable.name.toLowerCase().indexOf(term.toLowerCase()) >
                        -1) ||
                    (v.helpers &&
                        v.helpers
                            .map(h => h.name)
                            .join("")
                            .toLowerCase()
                            .indexOf(term.toLowerCase()) > -1)
            )
            .map(i => <SearchResult>{ type: SearchResultType.Initiative, result: i })
            .sort((a: SearchResult, b: SearchResult) => {
                if (a.result.name < b.result.name) { return -1; }
                if (a.result.name > b.result.name) { return 1; }
                return 0;
            });
    }

    findUsers(term: string): SearchResult[] {
        return uniqBy(
            flatten(this.list
                .map(i => i.getAllParticipants())
            ), u => u.user_id)
            .filter(u => u.name.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .map(i => <SearchResult>{ type: SearchResultType.User, result: i })
            .sort((a: SearchResult, b: SearchResult) => {
                if (a.result.name < b.result.name) { return -1; }
                if (a.result.name > b.result.name) { return 1; }
                return 0;
            });
    }

    addHeader(results: SearchResult[], header: SearchResult) {
        return results.length > 0 ? [header].concat(results) : [];
    }

    search = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .do((term: string) => {
                this.isSearching = true && term !== "";
                this.cd.markForCheck();
            })
            .map(search => {
                let usersHeader = <SearchResult>{ type: SearchResultType.User, result: null, header: 'People' };
                let circlesHeader = <SearchResult>{ type: SearchResultType.Initiative, result: null, header: 'Circles' };


                return search === ""
                    ? []
                    : this.findInitiatives(search).slice(0, 5)
            })
            .do(list => {
                this.searchResultsCount = list.length;
                this.cd.markForCheck();
            })

    formatter = (result: SearchResult) => {
        return result && result.result ? result.result.name : "dede";
    };

    getResultDisplay() {
        if (!this.selectedResult || !this.selectedResult.result) return "";
        // return this.selectedResult.type === SearchResultType.Initiative
        return this.selectedResult.result.name ? this.selectedResult.result.name : "New node";
        // : `${this.selectedResult.result.name}'s circles`
    }

    selectAllContent(event: Event) {
        (<any>event.target).select();
    }

    select(event: NgbTypeaheadSelectItemEvent) {
        if (!event.item || !event.item.result) return;
        if (event.item.type === SearchResultType.Initiative) {
            let initiative = event.item.result;
            this.isSearching = false;
            this.selectedResult = event.item.result;
            this.cd.markForCheck();
            this.selectInitiative.emit(initiative)
        }
        if (event.item.type === SearchResultType.User) {
            this.selectedResult = event.item.result;
            this.cd.markForCheck();
            this.selectUser.emit(event.item.result)
        }

        // this.zoomToInitiative$.next(initiative);
    }

    clearSearch() {
        // this.select({ item: null, preventDefault: null })
        // this.selectInitiative.emit(null);
        // this.selectUser.emit(null);
        this.clear.emit();
    }
}