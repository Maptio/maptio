import { Injectable, OnDestroy } from '@angular/core';

import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { SubSink } from 'subsink';

import { AppState } from '@maptio-state/app.state';
import { selectCurrentOrganisationId } from '@maptio-state/current-organisation.selectors';

import { UserService } from '../user/user.service';
import { Permissions, UserRoleService } from '../../model/permission.data';
import { Initiative } from '../../model/initiative.data';
import { Helper } from '../../model/helper.data';

@Injectable()
export class PermissionsService implements OnDestroy {
  Permission: Permissions;

  private currentOrganisationId$ = this.store
    .select(selectCurrentOrganisationId)
    .pipe(distinctUntilChanged());

  public userPermissions$ = combineLatest([
    this.userService.user$,
    this.currentOrganisationId$,
  ]).pipe(
    map(([user, currentOrganisationId]) => {
      // Convert the state object to get at the hidden ID of the current
      // organisation
      // TODO: This needs to be refactored away by a correct implementation of
      // state, selectors, etc.
      if (currentOrganisationId) {
        const currentUserRole = user.getUserRoleInOrganization(
          currentOrganisationId
        );
        return this.userRoleService.get(currentUserRole);
      } else {
        return [];
      }
    }),

    shareReplay(1)
  );

  // Keep the non-reactive version populated for now, see TODO below
  private userPermissions: Permissions[] = [];

  // This is perhaps what the service could look like if it was reactive
  public canSeeOnboardingMessages$ = this.userPermissions$.pipe(
    map((permissions) =>
      permissions.includes(Permissions.canSeeOnboardingMessages)
    )
  );

  constructor(
    private subs: SubSink,
    private store: Store<AppState>,
    private userService: UserService,
    private userRoleService: UserRoleService
  ) {
    // TODO: Ideally, it'd be nice to redo all of the permissions architecture
    // to be reactive, but this will take time, so let's keep the subscription
    // here until there's a reason to invest in redoing this
    this.subs.sink = this.userPermissions$.subscribe((permissions) => {
      this.userPermissions = permissions;
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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
