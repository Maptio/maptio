import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Role } from "../../../shared/model/role.data";

@Injectable()
export class RoleLibraryService {
    private roles: Role[] = [];

    // private roleDeletedSource = new Subject<Role>();

    // roleDeleted$ = this.roleDeletedSource.asObservable();

    roleAdded = new Subject<void>();
    roleEdited = new Subject<Role>();

    constructor() { }

    setRoles(roles: Role[]): void {
        this.roles = roles;
    }

    getRoles(): Role[] {
        return this.roles;
    }

    addRoleToLibrary(role: Role): void {
        if (role.isCustomRole()) {
            console.error("Attempted to add a custom role to the role library.");
            return;
        }

        const isRoleAlreadyInLibrary = this.roles.find((libraryRole) => libraryRole.shortid === role.shortid);
        if (isRoleAlreadyInLibrary) {
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

        const libraryRole = this.roles.find((libraryRole) => libraryRole.shortid === role.shortid);
        libraryRole.copyContentFrom(role);

        this.roleEdited.next(libraryRole);
    }

    deleteRoleFromLibrary(role: Role): void { }

    save(): void { }
}
