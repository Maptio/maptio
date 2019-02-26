import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Helper } from '../../../../../../../shared/model/helper.data';

@Component({
    selector: 'initiative-authority-select',
    templateUrl: './authority-select.component.html',
    // styleUrls: ['./authority-select.component.css']
})
export class InitiativeAuthoritySelectComponent implements OnInit {

    @Input("team") team: Team;
    @Input("authority") authority: User;
    @Input("isEditMode") isEditMode:boolean;
    @Output("save") save: EventEmitter<User> = new EventEmitter<User>();

    searching: boolean;
    searchFailed: boolean;
    @ViewChild("inputAuthority") public inputAuthority: ElementRef;
    

    constructor(private cd:ChangeDetectorRef) { }

    ngOnInit(): void { }

    onSelect(newAccountable: NgbTypeaheadSelectItemEvent) {
        let accountable = newAccountable.item as Helper;
        accountable.roles = [];
        this.authority = accountable;
        this.save.emit(this.authority);
        this.cd.markForCheck();
    }

    onBlur(){
        if(!this.authority){
            (<HTMLInputElement>this.inputAuthority.nativeElement).value ="";
        }else{
            (<HTMLInputElement>this.inputAuthority.nativeElement).value =this.authority.name;
        }
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

    formatter = (result: User) => { return result.name };

}
