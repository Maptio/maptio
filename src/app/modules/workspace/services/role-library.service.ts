import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Role } from "../../../shared/model/role.data";
import { Initiative } from "../../../shared/model/initiative.data";

@Injectable()
export class RoleLibraryService {
    private roles: Role[] = [];

    roleEdited = new Subject<Role>();
    roleDeleted = new Subject<Role>();

    constructor() { }

    setRoles(roles: Role[]): void {
        // Filter out stale non-library roles
        roles = roles.filter((role) => role.isLibraryRole());

        this.roles = roles;
    }

    getRoles(): Role[] {
        return this.roles;
    }

    findRoleInList(role: Role, roleList: Role[]): Role {
        return roleList.find((roleFromList) => {
            if (roleFromList && roleFromList.shortid && role && role.shortid) {
                return roleFromList.shortid === role.shortid
            } else {
                return false;
            }
        });
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

        return this.findRoleInList(role, this.roles);
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

    /**
     * Synchronise the roles in a dataset with library (team) roles
     * @param datasetRoles      State of library roles at the time of the last dataset save
     * @param rootInitiative    The first initiative node in the dataset
     */
    syncDatasetRoles(datasetRoles: Role[], rootInitiative: Initiative) {
        const rolesToBeDeleted: Role[] = [];
        const rolesToBeEdited: Role[] = [];

        // First, we identify all roles that need to be deleted or edited by comparing the dataset's roles with the
        // role library (i.e. team roles).
        datasetRoles.forEach((datasetRole) => {
            // Defend against stale undefined/null data
            if (!datasetRole.isLibraryRole()) {
                return;
            }

            const matchingLibraryRole = this.findRoleInList(datasetRole, this.roles);
            if (!matchingLibraryRole) {
                rolesToBeDeleted.push(datasetRole);
            } else if (!datasetRole.hasEqualContentAs(matchingLibraryRole)) {
                rolesToBeEdited.push(matchingLibraryRole);
            }
        });

        if (rolesToBeDeleted.length === 0 && rolesToBeEdited.length === 0) {
            return;
        }

        // Then, we walk through the dataset and update roles for all helpers
        rootInitiative.traverse((node: Initiative) => {
            // Select both helpers and the person accountable for the initiative
            const people = node.accountable ? node.helpers.concat([node.accountable]) : node.helpers;

            people.forEach((person) => {
                rolesToBeDeleted.forEach((roleToBeDeleted) => {
                    const matchingRoleIndex = person.roles.findIndex((role) => {
                        if (role && roleToBeDeleted) {
                            return role.shortid === roleToBeDeleted.shortid
                        } else {
                            return false;
                        }
                    });
                    if (matchingRoleIndex > -1) {
                        person.roles.splice(matchingRoleIndex, 1);
                    }
                });

                rolesToBeEdited.forEach((roleToBeEdited) => {
                    const matchingRole = person.roles.find((role) => {
                        if (role && roleToBeEdited) {
                            return role.shortid === roleToBeEdited.shortid
                        } else {
                            return false;
                        }
                    });
                    if (matchingRole) {
                        matchingRole.copyContentFrom(roleToBeEdited);
                    }
                });
            });
        });

        return;
    }
}
