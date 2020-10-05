import { Injectable } from '@angular/core';
import { Permissions } from '../../model/permission.data';
import { Initiative } from '../../model/initiative.data';
import { Helper } from '../../model/helper.data';
import { Auth } from '../../../core/authentication/auth.service';

@Injectable()
export class PermissionsService {

    Permission: Permissions;
    
    private userId:string;
    private userPermissions:Permissions[];

    constructor(auth:Auth){
        if (localStorage.getItem("profile")) {
            this.userId = JSON.parse(localStorage.getItem("profile")).user_id
        }
        this.userPermissions = auth.getPermissions();
    }

    public canMoveInitiative(): boolean {
        return this.userPermissions.includes(Permissions.canMoveInitiative)
    }

    public canEditInitiativeName( initiative:Initiative): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeName)
            // ||
            // !initiative.accountable
            // ||
            // (initiative.accountable && initiative.accountable.user_id === this.userId)
            // ||
            // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
    }

    public canEditInitiativeDescription( initiative:Initiative): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeDescription)
            // ||
            // !initiative.accountable
            // ||
            // (initiative.accountable && initiative.accountable.user_id === this.userId)
            // ||
            // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
    }

    public canEditInitiativeTags( initiative:Initiative): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeTags)
            // ||
            // !initiative.accountable
            // ||
            // (initiative.accountable && initiative.accountable.user_id === this.userId)
            // ||
            // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
    }

    public canEditInitiativeAuthority( initiative:Initiative): boolean {
        return this.userPermissions.includes(Permissions.canEditInitiativeAuthority)
            // ||
            // !initiative.accountable
            // ||
            // (initiative.accountable && initiative.accountable.user_id === this.userId)
    }

    public canAddHelper( initiative:Initiative): boolean {
        return this.userPermissions.includes(Permissions.canAddHelper)
            // ||
            // !initiative.accountable
            // ||
            // (initiative.accountable && initiative.accountable.user_id === this.userId)
            // ||
            // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
    }

    public canDeleteHelper( initiative:Initiative,helper:Helper): boolean {
        return this.userPermissions.includes(Permissions.canDeleteHelper)
            // ||
            // !initiative.accountable
            // ||
            // (initiative.accountable && initiative.accountable.user_id === this.userId)
            // ||
            // (helper.user_id === this.userId)
            // ||
            // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
    }

    public canEditHelper( initiative:Initiative,helper:Helper): boolean {
        return this.userPermissions.includes(Permissions.canEditHelper)
            // ||
            // !initiative.accountable
            // ||
            // (initiative.accountable && initiative.accountable.user_id === this.userId)
            // ||
            // (helper.user_id === this.userId)
            // ||
            // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
    }

    public canGiveHelperPrivilege( initiative:Initiative): boolean {
        return this.userPermissions.includes(Permissions.canEditHelper)
            // ||
            // (initiative.accountable && initiative.accountable.user_id === this.userId)
            // ||
            // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
    }

    public canDeleteInitiative( initiative:Initiative): boolean {
        return this.userPermissions.includes(Permissions.canDeleteInitiative)
            // ||
            // !initiative.accountable
            // ||
            // (initiative.accountable && initiative.accountable.user_id === this.userId)
            // ||
            // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
    }

    public canOpenInitiativeContextMenu(): boolean {
        return this.userPermissions.includes(Permissions.canOpenInitiativeContextMenu);
    }
}
