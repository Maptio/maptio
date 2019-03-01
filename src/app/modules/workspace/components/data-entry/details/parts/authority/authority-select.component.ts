import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { User } from '../../../../../../../shared/model/user.data';
import { Team } from '../../../../../../../shared/model/team.data';
import { Helper } from '../../../../../../../shared/model/helper.data';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';
import { CommonAutocompleteComponent } from '../../../../../../../shared/components/autocomplete/autocomplete.component';

@Component({
    selector: 'initiative-authority-select',
    templateUrl: './authority-select.component.html',
    // styleUrls: ['./authority-select.component.css']
})
export class InitiativeAuthoritySelectComponent implements OnInit {

    @Input("team") team: Team;
    @Input("authority") authority: Helper;
    @Input("isEditMode") isEditMode: boolean;
    @Output("save") save: EventEmitter<Helper> = new EventEmitter<Helper>();

    placeholder: string;

    @ViewChild("autocomplete") public autocompleteComponent:CommonAutocompleteComponent;

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

    // onBlur() {
    //     this.isEditMode = false;
    //     this.cd.markForCheck();
    // }

    // onFocus(){
    //     document.querySelector("#inputAutocomplete").dispatchEvent(new Event("click"));
    //     document.querySelector("#inputAutocomplete").dispatchEvent(new FocusEvent("focus"));
    //     this.isEditMode = true;
    //     this.cd.markForCheck();
    // }

    onRemove() {
        this.authority = null;
        this.save.emit(this.authority);
    }

    /**
     * Leave a fat arrow in order to fixate the this and be able to use in child component 
     * See : https://stackoverflow.com/a/54169646/7092722
     */
    filterMembers = (term: string) => {
        console.log("filterMembers", term)
        return term.length < 1
            ? this.authority ? this.team.members.filter(m => m.user_id !== this.authority.user_id) : this.team.members
            : (this.authority ? this.team.members.filter(m => m.user_id !== this.authority.user_id) : this.team.members)
                    .filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email))
    }

    formatter = (result: User) => { return result ? result.name : '' };

}
