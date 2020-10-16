import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Role } from "../../../shared/model/role.data";

@Injectable()
export class RoleLibraryService {
    private roles: Role[] = [];

    // private roleDeletedSource = new Subject<Role>();

    // roleDeleted$ = this.roleDeletedSource.asObservable();

    roleAdded = new Subject<void>();

    constructor() { }

    setRoles(roles: Role[]): void {
        this.roles = roles;
    }

    addRoleToLibrary(role: Role): void {
        if (!role.shortid) {
            console.error("Attempting to add a custom role to the role library.");
            return;
        }

        const isRoleAlreadyInLibrary = this.roles.find((libraryRole) => libraryRole.shortid === role.shortid)
        if (isRoleAlreadyInLibrary) {
            console.error("Attempting to add a role to the role library when it is already there.");
            return;
        }

        this.roles.push(role)
        this.roleAdded.next();
    }

    deleteRoleFromLibrary(role: Role): void { }
    editRole(role: Role): void { }

    save(): void { }
}
