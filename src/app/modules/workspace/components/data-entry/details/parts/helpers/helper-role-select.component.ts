// import { Component, OnInit, Input, Output, ChangeDetectorRef, SimpleChanges, EventEmitter } from '@angular/core';
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { isEqual } from "lodash-es";

// import { Team } from '../../../../../../../shared/model/team.data';
// import { Helper } from '../../../../../../../shared/model/helper.data';
// import { Role } from '../../../../../shared/model/role.data';
import { Role } from "../../../../../../../shared/model/role.data";
// import { of } from 'rxjs/observable/of';
// import { Auth } from '../../../../../../../core/authentication/auth.service';
// import { User } from '../../../../../../../shared/model/user.data';
// import { Subscription, Subject } from 'rxjs';
import { RoleLibraryService } from "../../../../../services/role-library.service";

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
    @Output("create") create = new EventEmitter<Role>();

    // placeholder: string;
    // subscription: Subscription;
    // isLoaded: boolean;

    // constructor(private auth: Auth, private cd: ChangeDetectorRef) { }
    constructor(private roleLibrary: RoleLibraryService) { }

    ngOnInit() {
    }

    // isCurrentUserAlredyAdded() {
    //     if (this.helpers && this.user) {
    //         return this.helpers.concat([this.authority]).filter(h => !!h).findIndex(h => h.user_id === this.user.user_id) > -1;
    //     }
    //     this.cd.markForCheck();
    // }

    onAddingRole(newRole: Role) {
        if (newRole.isLibraryRole()) {
            // We've picked an existing library role
            this.roles.unshift(newRole);
            this.pick.emit(this.roles);
        } else {
            // We've chosen to create a new role
            this.create.emit(newRole);
        }
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

        let roleChoices = [
            newRole,
        ];

        roleChoices = roleChoices.concat(this.roleLibrary.getRoles());

        // Don't show roles already on the helper
        roleChoices = roleChoices.filter((roleChoice) => {
            const isRoleChoiceInHelper = this.roles.find(roleInHelper => isEqual(roleInHelper, roleChoice));
            return !isRoleChoiceInHelper;
        });

        return roleChoices;
    }

}
