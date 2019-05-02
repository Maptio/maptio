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
    @Input("isUnauthorized") isUnauthorized:boolean;
    @Output("save") save: EventEmitter<Helper> = new EventEmitter<Helper>();

    placeholder: string;

    @ViewChild("autocomplete") public autocompleteComponent:CommonAutocompleteComponent;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.team && changes.team.currentValue) {
            // this.placeholder = `Who's the ${changes.team.currentValue.settings.authority.toLowerCase()} for this? Enter a team member`
            this.placeholder = "Start typing the name of a member"
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
    }

    /**
     * Leave a fat arrow in order to fixate the this and be able to use in child component 
     * See : https://stackoverflow.com/a/54169646/7092722
     */
    filterMembers = (term: string) => {
        return term.length < 1
            ? this.authority ? this.team.members.filter(m => m.user_id !== this.authority.user_id) : this.team.members
            : (this.authority ? this.team.members.filter(m => m.user_id !== this.authority.user_id) : this.team.members)
                    .filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email))
    }

    formatter = (result: User) => { return result ? result.name : '' };

}
