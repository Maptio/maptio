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
    canCreateMap,
    canEditTags,
    canEditMapName,
    canCreateRootInitiative,
    canCreateInitiative,
    canDeleteInitiative,
    canMoveInitiative,
    canEditInitiativeName,
    canEditInitiativeDescription,
    canEditInitiativeTags,
    canEditInitiativeAuthority,
    canOpenInitiativeContextMenu,
    canAddHelper,
    canDeleteHelper,
    canEditHelper,
    canEditLibraryRoles,
    canEditVacancies,
    canEditSize,
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
            Permissions.canEditTags,
            Permissions.canCreateTeam,
            Permissions.canInviteUser,
            Permissions.canCreateMap,
            Permissions.canEditMapName,
            Permissions.canCreateRootInitiative,
            Permissions.canCreateInitiative,
            Permissions.canDeleteInitiative,
            Permissions.canMoveInitiative,
            Permissions.canEditInitiativeName,
            Permissions.canEditInitiativeDescription,
            Permissions.canEditInitiativeTags,
            Permissions.canEditInitiativeAuthority,
            Permissions.canOpenInitiativeContextMenu,
            Permissions.canAddHelper,
            Permissions.canDeleteHelper,
            Permissions.canEditHelper,
            Permissions.canEditLibraryRoles,
            Permissions.canEditVacancies,
            Permissions.canEditSize,
            Permissions.canGiveHelperPrivileges,
            Permissions.canSubscribe
        ]
    }

    private getSuperPermissions(): Permissions[] {
        return this.getAdminPermissions().concat([Permissions.canCreateUnlimitedTeams])
    }
}
