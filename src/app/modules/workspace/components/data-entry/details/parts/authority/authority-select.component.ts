import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { User } from '../../../../../../../shared/model/user.data';
import { Team } from '../../../../../../../shared/model/team.data';
import { Helper } from '../../../../../../../shared/model/helper.data';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators';

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

    /**
     * Leave a fat arrow in order to fixate the this and be able to use in child component 
     * See : https://stackoverflow.com/a/54169646/7092722
     */
    filterMembers = (term: string) => {
        console.log("filterMembers", term)
        return term.length < 1
            ? of(this.authority ? this.team.members.filter(m => m.user_id !== this.authority.user_id) : this.team.members)
            : of(this.authority ? this.team.members.filter(m => m.user_id !== this.authority.user_id) : this.team.members)
                .pipe(
                    map(ms => ms.filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email)).splice(0, 10))
                )

    }

    formatter = (result: User) => { return result ? result.name : '' };

}
