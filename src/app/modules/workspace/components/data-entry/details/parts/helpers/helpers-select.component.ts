import { Component, OnInit, Input, Output, ChangeDetectorRef, SimpleChanges, EventEmitter } from '@angular/core';
import { Team } from '../../../../../../../shared/model/team.data';
import { Helper } from '../../../../../../../shared/model/helper.data';
import { of } from 'rxjs/observable/of';

@Component({
    selector: 'initiative-helpers-select',
    templateUrl: './helpers-select.component.html',
    // styleUrls: ['./helpers-select.component.css'] 
})
export class InitiativeHelpersSelectComponent implements OnInit {

    @Input("team") team: Team;
    @Input("helpers") helpers: Helper[];
    @Input("authority") authority: Helper;
    @Input("isEditMode") isEditMode: boolean;

    @Output("save") save: EventEmitter<Array<Helper>> = new EventEmitter<Array<Helper>>();

    placeholder: string;

    constructor(private cd: ChangeDetectorRef) { }


    onAddingHelper(newHelper: Helper) {
        if ((this.authority && newHelper.user_id === this.authority.user_id) || this.helpers.findIndex(user => user.user_id === newHelper.user_id) > 0) {
            return
        }

        newHelper.roles = [];
        this.helpers.unshift(newHelper);

        this.save.emit(this.helpers);
        this.cd.markForCheck();
    }

    ngOnInit() {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.team && changes.team.currentValue) {
            this.placeholder = `Enter the name of a ${(changes.team.currentValue as Team).settings.helper.toLowerCase()}`
        }
    }

   

    formatter = (result: Helper) => { return result ? result.name : '' };

    /**
    * Leave a fat arrow in order to fixate the this and be able to use in child component 
    * See : https://stackoverflow.com/a/54169646/7092722
    */
    filterMembers = (term: string) => {
        return term.length < 1
            ? this.team.members
            : this.team.members.filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email));
    }

}
