import { Injectable } from '@angular/core';

import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { EmitterService } from '@maptio-core/services/emitter.service';

import { UserService } from '../user/user.service';
import { Permissions, UserRoleService } from '../../model/permission.data';
import { Initiative } from '../../model/initiative.data';
import { Helper } from '../../model/helper.data';

@Injectable()
export class PermissionsService {
  Permission: Permissions;

  // TODO: Move to non-archaic state management
  private currentTeam$ = EmitterService.get('currentTeam');
  private userPermissions: Permissions[];

  private userPermissions$ = combineLatest([
    this.userService.user$,
    this.currentTeam$,
  ]).pipe(
    map(([user, currentTeam]) => {
      if (currentTeam) {
        const currentUserRole = user.getUserRoleInOrganization(
          currentTeam.team_id
        );
        return this.userRoleService.get(currentUserRole);
      } else {
        return [];
      }
    })
  );

  constructor(
    private userService: UserService,
    private userRoleService: UserRoleService
  ) {
    // // TODO: REDO the dependencies of this to make the flow reactive
    // // TODO: unsubscribe
    // this.userService.user$.subscribe((user) => {
    //   // TODO: HARDCODED FOR NOW!!!
    //   // "Guardians of the Galaxy" where I'm an admin...
    //   const currentTeamId = '59bed8e434a28352f6b9a0a8';
    //   // "Test with Tom" where I'm a standard user...
    //   // const currentTeamId = '618bf6bacf864d00043fd960';

    //   const currentUserRole = user.getUserRoleInOrganization(currentTeamId);
    //   this.userPermissions = this.userRoleService.get(currentUserRole);
    // });

    this.userPermissions$.subscribe((permissions) => {
      this.userPermissions = permissions;
    });
  }

  public getUserPermissions(): Permissions[] {
    return this.userPermissions;
  }

  public canMoveInitiative(): boolean {
    return this.userPermissions.includes(Permissions.canMoveInitiative);
  }

  public canEditInitiativeName(initiative: Initiative): boolean {
    return this.userPermissions.includes(Permissions.canEditInitiativeName);
    // TODO: Refactor into small functions - there's lots of repetition here and we could clean the lines below
    // with more readable helper functions (see some possible names below)
    // TODO: || isWithoutLead(initiative)
    // ||
    // !initiative.accountable
    // TODO: || isLeadOf(initiative)
    // ||
    // (initiative.accountable && initiative.accountable.user_id === this.userId)
    // TODO: || hasAuthorityPriviligesFor(initiative)
    // ||
    // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
  }

  public canEditInitiativeDescription(initiative: Initiative): boolean {
    return this.userPermissions.includes(
      Permissions.canEditInitiativeDescription
    );
    // ||
    // !initiative.accountable
    // ||
    // (initiative.accountable && initiative.accountable.user_id === this.userId)
    // ||
    // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
  }

  public canEditInitiativeTags(initiative: Initiative): boolean {
    return this.userPermissions.includes(Permissions.canEditInitiativeTags);
    // ||
    // !initiative.accountable
    // ||
    // (initiative.accountable && initiative.accountable.user_id === this.userId)
    // ||
    // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
  }

  public canEditInitiativeAuthority(initiative: Initiative): boolean {
    return this.userPermissions.includes(
      Permissions.canEditInitiativeAuthority
    );
    // ||
    // !initiative.accountable
    // ||
    // (initiative.accountable && initiative.accountable.user_id === this.userId)
  }

  public canAddHelper(initiative: Initiative): boolean {
    return this.userPermissions.includes(Permissions.canAddHelper);
    // ||
    // !initiative.accountable
    // ||
    // (initiative.accountable && initiative.accountable.user_id === this.userId)
    // ||
    // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
  }

  public canDeleteHelper(initiative: Initiative, helper: Helper): boolean {
    return this.userPermissions.includes(Permissions.canDeleteHelper);
    // ||
    // !initiative.accountable
    // ||
    // (initiative.accountable && initiative.accountable.user_id === this.userId)
    // ||
    // (helper.user_id === this.userId)
    // ||
    // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
  }

  public canEditHelper(initiative: Initiative, helper: Helper): boolean {
    return this.userPermissions.includes(Permissions.canEditHelper);
    // ||
    // !initiative.accountable
    // ||
    // (initiative.accountable && initiative.accountable.user_id === this.userId)
    // ||
    // (helper.user_id === this.userId)
    // ||
    // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
  }

  public canEditVacancies(): boolean {
    return this.userPermissions.includes(Permissions.canEditVacancies);
  }

  public canEditSize(): boolean {
    return this.userPermissions.includes(Permissions.canEditSize);
  }

  public canEditLibraryRoles(): boolean {
    return this.userPermissions.includes(Permissions.canEditLibraryRoles);
  }

  public canGiveHelperPrivilege(initiative: Initiative): boolean {
    return this.userPermissions.includes(Permissions.canEditHelper);
    // ||
    // (initiative.accountable && initiative.accountable.user_id === this.userId)
    // ||
    // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
  }

  public canDeleteInitiative(initiative: Initiative): boolean {
    return this.userPermissions.includes(Permissions.canDeleteInitiative);
    // ||
    // !initiative.accountable
    // ||
    // (initiative.accountable && initiative.accountable.user_id === this.userId)
    // ||
    // (initiative.helpers.filter(h => h.hasAuthorityPrivileges).map(h => h.user_id).includes(this.userId))
  }

  public canOpenInitiativeContextMenu(): boolean {
    return this.userPermissions.includes(
      Permissions.canOpenInitiativeContextMenu
    );
  }

  public canCreateUnlimitedTeams(): boolean {
    return this.userPermissions.includes(Permissions.canCreateUnlimitedTeams);
  }
}
