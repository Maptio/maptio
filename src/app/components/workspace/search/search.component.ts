import { Initiative } from "./../../../shared/model/initiative.data";
import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";

import { NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs/Observable";
import { User } from "../../../shared/model/user.data";
import { flatten, uniqBy } from "lodash-es"

export enum SearchResultType {
    Initiative,
    User
}

class SearchResult {
    type: SearchResultType
    result: User | Initiative
}

@Component({
    selector: "search",
    templateUrl: "./search.component.html",
    styleUrls: ["./search.component.css"]
})
export class SearchComponent implements OnInit {
    @Input() list: Initiative[];
    @Output() selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();
    @Output() selectUser: EventEmitter<User> = new EventEmitter<User>();

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit() { }

    public searchResultsCount: number;
    public isSearching: boolean;
    SearchResultType = SearchResultType;

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
            .map(i => <SearchResult>{ type: SearchResultType.Initiative, result: i });
    }

    findUsers(term: string): SearchResult[] {
        return uniqBy(
            flatten(this.list
                .map(i => i.getAllParticipants())
            ), u => u.user_id)
            .filter(u => u.name.toLowerCase().indexOf(term.toLowerCase()) > -1)
            .map(i => <SearchResult>{ type: SearchResultType.User, result: i });
    }

    // searchInitiatives = (text$: Observable<string>) =>
    //     text$
    //         .debounceTime(200)
    //         .distinctUntilChanged()
    //         .do((term: string) => {
    //             this.isSearching = true && term !== "";
    //             this.cd.markForCheck();
    //         })
    //         .map(search => {
    //             return search === ""
    //                 ? this.list
    //                 : this.filter(search)
    //         })
    //         .do(list => {
    //             this.searchResultsCount = list.length;
    //             this.cd.markForCheck();
    //         });


    search = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .do((term: string) => {
                this.isSearching = true && term !== "";
                this.cd.markForCheck();
            })
            .map(search => {
                return search === ""
                    ? this.list
                    : this.findUsers(search).concat(this.findInitiatives(search)).slice(0, 10)
            })
            .do(list => {
                this.searchResultsCount = list.length;
                this.cd.markForCheck();
            })

    formatter = (result: Initiative) => {
        return result.name;
    };

    select(event: NgbTypeaheadSelectItemEvent) {
        if (!event.item || !event.item.result) return;
        if (event.item.type === SearchResultType.Initiative) {
            let initiative = event.item.result;
            this.isSearching = false;
            this.cd.markForCheck();
            this.selectInitiative.emit(initiative)
        }
        if (event.item.type === SearchResultType.User) {
            this.selectUser.emit(event.item.result)
        }

        // this.zoomToInitiative$.next(initiative);
    }

    clearSearch() {
        // this.select({ item: null, preventDefault: null })
        this.selectInitiative.emit(null);
    }
}