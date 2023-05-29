import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';

import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

import { flatten, uniqBy } from 'lodash-es';

import { Initiative } from '@maptio-shared/model/initiative.data';
import { User } from '@maptio-shared/model/user.data';

export enum SearchResultType {
  Initiative,
  User,
}

class SearchResult {
  type: SearchResultType;
  result: User | Initiative;
  header?: string;
}

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  @Input() list: Initiative[];
  @Output()
  selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();
  @Output() selectUser: EventEmitter<User> = new EventEmitter<User>();

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {}

  public searchResultsCount: number;
  public isSearching: boolean;
  SearchResultType = SearchResultType;

  findInitiatives(term: string): SearchResult[] {
    const searchTerm = term.toLowerCase();

    const matchingInitiatives = this.list.filter((initiative) => {
      const name = initiative.name?.toLowerCase();
      const nameMatches = name?.includes(searchTerm);

      const description = initiative.description?.toLowerCase();
      const descriptionMatches = description?.includes(searchTerm);

      const accountable = initiative.accountable?.name?.toLowerCase();
      const accountableMatches = accountable?.includes(searchTerm);

      const participants = initiative
        .getAllParticipants()
        .map((participant) => participant.name.toLowerCase())
        .join('');
      const participantsMatch = participants?.includes(searchTerm);

      const roles = initiative
        .getAllParticipants()
        .flatMap((participant) => participant.roles ?? [])
        .map((role) =>
          `${role?.title ?? ''} ${role?.description ?? ''}`.toLowerCase()
        )
        .join('');
      const rolesMatch = roles?.includes(searchTerm);

      return (
        nameMatches ||
        descriptionMatches ||
        accountableMatches ||
        participantsMatch ||
        rolesMatch
      );
    });

    // Convert to search results
    return matchingInitiatives.map(
      (i) => <SearchResult>{ type: SearchResultType.Initiative, result: i }
    );
  }

  findUsers(term: string): SearchResult[] {
    return uniqBy(
      flatten(this.list.map((i) => i.getAllParticipants())),
      (u) => u.user_id
    )
      .filter((u) => u.name.toLowerCase().indexOf(term.toLowerCase()) > -1)
      .map((i) => <SearchResult>{ type: SearchResultType.User, result: i });
  }

  addHeader(results: SearchResult[], header: SearchResult) {
    return results.length > 0 ? [header].concat(results) : [];
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
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap((term: string) => {
        this.isSearching = true && term !== '';
        this.cd.markForCheck();
      }),
      map((search) => {
        const usersHeader = <SearchResult>{
          type: SearchResultType.User,
          result: null,
          header: 'People',
        };
        const circlesHeader = <SearchResult>{
          type: SearchResultType.Initiative,
          result: null,
          header: 'Circles',
        };

        return search === ''
          ? []
          : this.addHeader(this.findUsers(search), usersHeader)
              .concat(
                this.addHeader(this.findInitiatives(search), circlesHeader)
              )
              .slice(0, 10);
      }),
      tap((list) => {
        this.searchResultsCount = list.length;
        this.cd.markForCheck();
      })
    );

  formatter = (result: Initiative) => {
    return result.name;
  };

  select(event: NgbTypeaheadSelectItemEvent) {
    if (!event.item || !event.item.result) return;
    if (event.item.type === SearchResultType.Initiative) {
      const initiative = event.item.result;
      this.isSearching = false;
      this.cd.markForCheck();
      this.selectInitiative.emit(initiative);
    }
    if (event.item.type === SearchResultType.User) {
      this.selectUser.emit(event.item.result);
    }

    // this.zoomToInitiative$.next(initiative);
  }

  clearSearch() {
    // this.select({ item: null, preventDefault: null })
    this.selectInitiative.emit(null);
  }
}
