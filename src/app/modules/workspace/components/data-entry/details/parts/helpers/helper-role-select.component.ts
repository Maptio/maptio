import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { isEqual, cloneDeep } from "lodash-es";

import { Role } from "../../../../../../../shared/model/role.data";
import { RoleLibraryService } from "../../../../../services/role-library.service";

@Component({
    selector: "initiative-helper-role-select",
    templateUrl: "./helper-role-select.component.html",
})
export class InitiativeHelperRoleSelectComponent implements OnInit {

    @Input("roles") roles: Role[];

    @Output("pick") pick = new EventEmitter<Array<Role>>();
    @Output("create") create = new EventEmitter<Role>();

    constructor(private roleLibrary: RoleLibraryService) { }

    ngOnInit() {
    }

    onAddingRole(newRole: Role) {
        if (newRole.isLibraryRole()) {
            // We've picked an existing library role
            const roleCopy = cloneDeep(newRole);
            this.roles.unshift(roleCopy);
            this.pick.emit(this.roles);
        } else {
            // We've chosen to create a new role
            this.create.emit(newRole);
        }
    }

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

        // Filter by title using the search term provided
        roleChoices = roleChoices.filter((roleChoice) => new RegExp(term, "gi").test(roleChoice.title));

        return roleChoices;
    }

}
