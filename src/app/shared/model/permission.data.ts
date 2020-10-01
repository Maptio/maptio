export enum UserRole {
    /**
     * Standard user
     */
    Standard,
    /**
   * Administrator
   */
    Admin,
    /**
     * Superuser i.e. Maptio people 
     */
    Superuser
}

export enum Permissions {
    canAddUser = 1, // Start from 1 (to avoid `Permissions.canAddUser === false`) and auto-increment
    canDeleteUser,
    canEditUser,
    canInviteUser,
    canCreateTeam,
    canCreateUnlimitedTeams,
    canEditTeam,
    canEditMapName, 
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
    canGiveHelperPrivileges,
    canSubscribe

}


export class UserRoleService {
    get(status: UserRole) {
        switch (status) {
            case UserRole.Standard:
                return this.getStandardPermissions();
            case UserRole.Admin:
                return this.getAdminPermissions();
            case UserRole.Superuser:
                return this.getSuperPermissions();
            default:
                throw new Error(`No permissions can be found for status ${status}`)
        }
    }

    private getStandardPermissions(): Permissions[] {
        return [];
    }

    private getAdminPermissions(): Permissions[] {
        return [
            Permissions.canAddUser,
            Permissions.canDeleteUser,
            Permissions.canEditUser,
            Permissions.canEditTeam,
            Permissions.canCreateTeam,
            Permissions.canInviteUser,
            Permissions.canEditMapName,
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
            Permissions.canGiveHelperPrivileges,
            Permissions.canSubscribe
        ]
    }

    private getSuperPermissions(): Permissions[] {
        return this.getAdminPermissions().concat([Permissions.canCreateUnlimitedTeams])
    }
}
