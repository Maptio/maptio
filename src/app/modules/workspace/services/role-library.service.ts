import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Role } from "../../../shared/model/role.data";

@Injectable()
export class RoleLibraryService {
    private roles: Role[] = [];

    roleAdded = new Subject<void>();
    roleEdited = new Subject<Role>();
    roleDeleted = new Subject<Role>();

    constructor() { }

    setRoles(roles: Role[]): void {
        this.roles = roles;
    }

    getRoles(): Role[] {
        return this.roles;
    }

    /**
     * Find library role matching (by shortid) the given role
     * @param   role  Role to look for in the library
     * @returns       Matching library role or undefined
     */
    findRoleInLibrary(role: Role): Role {
        if (role.isCustomRole()) {
            console.error("Attempted to search for a custom role with role library service.");
            return;
        }

        return this.roles.find((libraryRole) => libraryRole.shortid === role.shortid);
    }

    addRoleToLibrary(role: Role): void {
        if (role.isCustomRole()) {
            console.error("Attempted to add a custom role to the role library.");
            return;
        }

        if (this.findRoleInLibrary(role)) {
            console.error("Attempted to add a role to the role library when it is already there.");
            return;
        }

        this.roles.push(role)
        this.roleAdded.next();
    }

    editRole(role: Role): void {
        if (role.isCustomRole()) {
            console.error("Attempted to save edits to a custom role with role library service.");
            return;
        }

        const libraryRole = this.findRoleInLibrary(role);
        libraryRole.copyContentFrom(role);

        this.roleEdited.next(libraryRole);
    }

    deleteRoleFromLibrary(role: Role): void {
        if (role.isCustomRole()) {
            console.error("Attempted delete a custom role with role library service.");
            return;
        }

        const libraryRole = this.findRoleInLibrary(role);
        if (!libraryRole) {
            console.error("Attempted to delete a role that can't be found in the role library.");
            return;
        }

        const libraryRoleIndex = this.roles.indexOf(libraryRole, 0);
        if (libraryRoleIndex > -1) {
            this.roles.splice(libraryRoleIndex, 1);
        }

        this.roleDeleted.next(libraryRole);
    }
}
