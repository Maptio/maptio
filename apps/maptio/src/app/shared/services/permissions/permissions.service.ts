import { Injectable } from '@angular/core';

import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngrx/store';

// TODO: Remove
import { EmitterService } from '@maptio-core/services/emitter.service';
import { AppState } from '@maptio-state/app.state';
import { selectCurrentOrganisationId } from '@maptio-state/current-organisation.selectors';

import { UserService } from '../user/user.service';
import { Permissions, UserRoleService } from '../../model/permission.data';
import { Initiative } from '../../model/initiative.data';
import { Helper } from '../../model/helper.data';

@Injectable()
export class PermissionsService {
  Permission: Permissions;

  // TODO: Remove
  private currentTeam$ = EmitterService.get('currentTeam');

  private currentOrganisationId$ = this.store.select(
    selectCurrentOrganisationId
  );

  private userPermissions$ = combineLatest([
    this.userService.user$,
    this.currentOrganisationId$,
  ]).pipe(
    map(([user, state]) => {
      // Convert the state object to get at the hidden ID of the current
      // organisation
      // TODO: This needs to be refactored away by a correct implementation of
      // state, selectors, etc.
      const currentOrganisationId = ((state as unknown) as AppState)
        ?.currentOrganisationId;

      if (currentOrganisationId) {
        const currentUserRole = user.getUserRoleInOrganization(
          currentOrganisationId
        );
        return this.userRoleService.get(currentUserRole);
      } else {
        return [];
      }
    })
  );

  // Keep the non-reactive version populated for now
  private userPermissions: Permissions[] = [];

  constructor(
    private store: Store,
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

    // this.currentOrganisationId$.subscribe((currentOrganisationId) => {
    //   console.log('currentOrganisationId', currentOrganisationId);
    // });

    // We'll keep the non-reactive version of the user permissions populated
    // for now as we transition
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
