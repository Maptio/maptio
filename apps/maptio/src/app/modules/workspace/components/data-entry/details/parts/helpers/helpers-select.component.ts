import { Component, OnInit, Input, Output, ChangeDetectorRef, SimpleChanges, EventEmitter } from '@angular/core';
import { Team } from '../../../../../../../shared/model/team.data';
import { Helper } from '../../../../../../../shared/model/helper.data';
import { of ,  Subscription, Subject } from 'rxjs';
import { Auth } from '../../../../../../../core/authentication/auth.service';
import { User } from '../../../../../../../shared/model/user.data';
import { cloneDeep } from "lodash-es";

@Component({
    selector: 'initiative-helpers-select',
    templateUrl: './helpers-select.component.html',
    // styleUrls: ['./helpers-select.component.css'] 
})
export class InitiativeHelpersSelectComponent implements OnInit {

    @Input("team") team: Team;
    @Input("helpers") helpers: Helper[];
    @Input("user") user: User;
    @Input("authority") authority: Helper;
    @Input("isEditMode") isEditMode: boolean;
    @Input("isUnauthorized") isUnauthorized: boolean;

    @Output("save") save: EventEmitter<Array<Helper>> = new EventEmitter<Array<Helper>>();

    placeholder: string;
    subscription: Subscription;
    isLoaded: boolean;
    
    constructor(private auth: Auth, private cd: ChangeDetectorRef) { }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.team && changes.team.currentValue) {
            this.placeholder = `Start typing the name of a ${(changes.team.currentValue as Team).settings.helper.toLowerCase()}`
        }
        this.cd.markForCheck();
    }


    isCurrentUserAlredyAdded() {
        if (this.helpers && this.user) {
            return this.helpers.concat([this.authority]).filter(h => !!h).findIndex(h => h.user_id === this.user.user_id) > -1;
        }
        this.cd.markForCheck();
    }


    onAddingHelper(newHelper: Helper) {
        if ((this.authority && newHelper.user_id === this.authority.user_id) || this.helpers.findIndex(user => user.user_id === newHelper.user_id) > 0) {
            return
        }
        if(this.helpers.findIndex(h => h.user_id === newHelper.user_id) > -1){
            return;
        }

        // Create a copy to avoid adding the same object to multiple initiative
        // and overwriting roles across initiatives
        const helperCopy = cloneDeep(newHelper);
        helperCopy.roles = [];

        this.helpers.unshift(helperCopy);

        this.save.emit(this.helpers);
        this.cd.markForCheck();
    }

    onAddingCurrentUser() {
        this.onAddingHelper(this.user as Helper)
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
