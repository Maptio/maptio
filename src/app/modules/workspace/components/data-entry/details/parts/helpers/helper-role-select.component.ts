// import { Component, OnInit, Input, Output, ChangeDetectorRef, SimpleChanges, EventEmitter } from '@angular/core';
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
// import { Team } from '../../../../../../../shared/model/team.data';
// import { Helper } from '../../../../../../../shared/model/helper.data';
// import { Role } from '../../../../../shared/model/role.data';
import { Role } from "../../../../../../../shared/model/role.data";
// import { of } from 'rxjs/observable/of';
// import { Auth } from '../../../../../../../core/authentication/auth.service';
// import { User } from '../../../../../../../shared/model/user.data';
// import { Subscription, Subject } from 'rxjs';
// import { cloneDeep } from "lodash-es";

@Component({
    selector: "initiative-helper-role-select",
    templateUrl: "./helper-role-select.component.html",
    // styleUrls: ['./helpers-select.component.css']
})
export class InitiativeHelperRoleSelectComponent implements OnInit {

    // @Input("team") team: Team;
    @Input("roles") roles: Role[];
    // @Input("user") user: User;
    // @Input("authority") authority: Helper;
    // @Input("isEditMode") isEditMode: boolean;
    // @Input("isUnauthorized") isUnauthorized: boolean;

    @Output("pick") pick = new EventEmitter<Array<Role>>();

    // placeholder: string;
    // subscription: Subscription;
    // isLoaded: boolean;

    // constructor(private auth: Auth, private cd: ChangeDetectorRef) { }

    ngOnInit() {
    }



    // isCurrentUserAlredyAdded() {
    //     if (this.helpers && this.user) {
    //         return this.helpers.concat([this.authority]).filter(h => !!h).findIndex(h => h.user_id === this.user.user_id) > -1;
    //     }
    //     this.cd.markForCheck();
    // }


    onAddingRole(newRole: Role) {
        if (!newRole.shortid) {
            this.roles.unshift(newRole);
        }
    //     if ((this.authority && newHelper.user_id === this.authority.user_id) || this.helpers.findIndex(user => user.user_id === newHelper.user_id) > 0) {
    //         return
    //     }
    //     if(this.helpers.findIndex(h => h.user_id === newHelper.user_id) > -1){
    //         return;
    //     }

    //     // Create a copy to avoid adding the same object to multiple initiative
    //     // and overwriting roles across initiatives
    //     const helperCopy = cloneDeep(newHelper);
    //     helperCopy.roles = [];

    //     this.helpers.unshift(helperCopy);

        this.pick.emit(this.roles);
    //     this.cd.markForCheck();
    }

    // onAddingCurrentUser() {
    //     this.onAddingHelper(this.user as Helper)
    // }



    // /**
    // * Leave a fat arrow in order to fixate the this and be able to use in child component 
    // * See : https://stackoverflow.com/a/54169646/7092722
    // */
    filterRoles = (term: string) => {
        const newRole = new Role();
        newRole.title = term;

        const roleChoices = [
            newRole,
        ];

        return roleChoices;
        // return term.length < 1
        //     ? this.team.members
        //     : this.team.members.filter(v => new RegExp(term, "gi").test(v.name) || new RegExp(term, "gi").test(v.email));
    }

}




//
// To be deleted when I'm certain it's OK to do so
//

// formatter = (result: Helper) => { return result ? result.name : '' };

// ngOnChanges(changes: SimpleChanges): void {
//     if (changes.team && changes.team.currentValue) {
//         this.placeholder = `Start typing the name of a ${(changes.team.currentValue as Team).settings.helper.toLowerCase()}`
//     }
//     this.cd.markForCheck();
// }
