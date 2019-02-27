import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { User } from '../../../../../../../shared/model/user.data';
import { Observable } from 'rxjs/Observable';
import { _do } from 'rxjs/operator/do';
import { switchMap } from 'rxjs/operator/switchMap';
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { _catch } from 'rxjs/operator/catch';
import { map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { Team } from '../../../../../../../shared/model/team.data';
import { Helper } from '../../../../../../../shared/model/helper.data';

@Component({
    selector: 'initiative-authority-select',
    templateUrl: './authority-select.component.html',
    // styleUrls: ['./authority-select.component.css']
})
export class InitiativeAuthoritySelectComponent implements OnInit {

    @Input("team") team: Team;
    @Input("authority") authority: User;
    @Input("isEditMode") isEditMode: boolean;
    @Output("save") save: EventEmitter<User> = new EventEmitter<User>();

    searching: boolean;
    searchFailed: boolean;
    placeholder: string;


    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.team && changes.team.currentValue) {
            this.placeholder = `Who's the ${changes.team.currentValue.settings.authority.toLowerCase()} for this? Enter a team member`
        }
    }

    onSelect(newAccountable: Helper) {
        if (newAccountable) newAccountable.roles = [];
        this.authority = newAccountable;
        this.save.emit(this.authority);
    }



    onRemove() {
        this.authority = null;
        this.save.emit(this.authority);
        this.cd.markForCheck();
    }


    searchTeamMember = (text$: Observable<string>) =>
        _do.call(
            switchMap.call(
                _do.call(
                    distinctUntilChanged.call(
                        debounceTime.call(text$, 300)),
                    () => this.searching = true),
                (term: string) =>
                    _catch.call(
                        _do.call(

                            this.filterMembers(term)
                            , () => this.searchFailed = false),
                        () => {
                            this.searchFailed = true;
                            return Observable.of.call([]);
                        }
                    )
            ),
            () => this.searching = false);

    filterMembers(term: string): Observable<User[]> {
        return term.length < 1
            ? of(this.authority ? this.team.members.filter(m => m.user_id !== this.authority.user_id) : this.team.members)
            : of(this.authority ? this.team.members.filter(m => m.user_id !== this.authority.user_id) : this.team.members)
                .pipe(
                    map(ms => ms.filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email)).splice(0, 10))
                )

    }

    formatter = (result: User) => { return result ? result.name : '' };

}
