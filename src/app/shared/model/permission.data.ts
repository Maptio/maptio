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
    Nothing, // HACK : to avoid (Permissions.canAddUser) = false (because its index is 0)
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
    canEditInitiativeTags,
    canEditInitiativeAuthority,
    canAddHelper,
    canDeleteHelper,
    canEditHelper,
    canGiveHelperPrivileges

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
            Permissions.canEditInitiativeName,
            Permissions.canEditInitiativeDescription,
            Permissions.canEditInitiativeTags,
            Permissions.canEditInitiativeAuthority,
            Permissions.canAddHelper,
            Permissions.canDeleteHelper,
            Permissions.canEditHelper,
            Permissions.canGiveHelperPrivileges
        ]
    }
}