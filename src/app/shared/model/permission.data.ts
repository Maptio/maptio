export enum UserRole {
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
    canAddUser,
    canDeleteUser,
    canEditUser,
    canInviteUser,
    canCreateTeam,
    canEditTeam,

    canCreateInitiative,
    canDeleteInitiative,
    canMoveInitiative,
    canEditInitiativeName,
    canEditInitiativeDescription,
    canEditInitiativeTags

}


export class PermissionService {
    get(status: UserRole) {
        switch (status) {
            case UserRole.Standard:
                return this.getStandardPermissions();
            case UserRole.Admin:
                return this.getAdminPermissions();
            default:
                throw new Error(`No permissions can be found for status ${status}`)
        }
    }

    private getStandardPermissions(): Permissions[] {
        return [
            Permissions.canCreateInitiative
        ]
    }

    private getAdminPermissions(): Permissions[] {
        return [
            Permissions.canAddUser,
            Permissions.canDeleteUser,
            Permissions.canEditUser,
            Permissions.canEditTeam,
            Permissions.canCreateTeam,
            Permissions.canInviteUser,
            Permissions.canCreateInitiative,
            Permissions.canDeleteInitiative,
            Permissions.canMoveInitiative,
        ]
    }
}