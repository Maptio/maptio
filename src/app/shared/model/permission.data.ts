export enum Status {
    /**
     * Standard user
     */
    Standard,
    /**
   * Administrator
   */
    Admin
}

export enum Permissions {
    AddInitiative,
    DeleteInitiative,
    EditInitiative,
    ViewInitiative,

    AddHelper,
    RemoveHelper,

    AddAuthority,
    RemoveAuthority,

    EditDescription,

    AddUser,
    RemoveUser,
    EditUser,

    EditTeam,
    EditStatus
}


export class PermissionService {
    get(status: Status) {
        switch (status) {
            case Status.Standard:
                return this.getStandardPermissions();
            case Status.Admin:
                return this.getAdminPermissions();
            default:
                throw new Error(`No permissions can be found for status ${status}`)
        }
    }

    private getStandardPermissions(): Permissions[] {
        // Add new initiatives but not delete them
        // Add or remove themselves from any initiative and change their roles
        // Add other helpers to initiatives and set their roles (but not remove them from initiatives)

        return [
            Permissions.AddInitiative,
            Permissions.AddHelper
        ]
    }

    private getAdminPermissions(): Permissions[] {
        // Everything a regular user can do
        // can change authority, helper and description on any initiative
        // can add or remove users to a team
        // can change the team jargon
        return [
            Permissions.AddInitiative,
            Permissions.DeleteInitiative,
            Permissions.EditInitiative,
            Permissions.ViewInitiative,
            Permissions.AddHelper,
            Permissions.RemoveHelper,
            Permissions.AddAuthority,
            Permissions.RemoveAuthority,
            Permissions.EditDescription,
            Permissions.AddUser,
            Permissions.RemoveUser,
            Permissions.EditUser,
            Permissions.EditTeam,
            Permissions.EditStatus
        ]
    }
}