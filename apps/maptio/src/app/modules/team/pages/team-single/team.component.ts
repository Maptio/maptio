import { DataSet } from '../../../../shared/model/dataset.data';
import { Permissions } from '../../../../shared/model/permission.data';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Team } from '../../../../shared/model/team.data';
import { Subscription } from 'rxjs';
import { OnInit } from '@angular/core';
import { Component, ChangeDetectorRef } from '@angular/core';
import { EmitterService } from '../../../../core/services/emitter.service';
import { TeamMembersComponent } from '../team-members/members.component';
import { TeamImportComponent } from '../team-import/import.component';
import { TeamMapsComponent } from '../team-maps/maps.component';
import { TeamSettingsComponent } from '../team-settings/settings.component';
import { TeamIntegrationsComponent } from '../team-integrations/integrations.component';
import { TeamBillingComponent } from '../team-billing/billing.component';

import { Store } from '@ngrx/store';

import { AppState } from '@maptio-state/app.state';
import { setCurrentOrganisationId } from '@maptio-state/global.actions';
import { PermissionsDirective } from '../../../../shared/directives/permission.directive';
import { NgIf } from '@angular/common';

@Component({
  selector: 'team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIf,
    PermissionsDirective,
    RouterOutlet,
  ],
})
export class TeamComponent implements OnInit {
  routeSubscription: Subscription;

  team: Team;
  Permissions = Permissions;
  pageName: string;
  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.data.subscribe(
      (data: { assets: { team: Team; datasets: DataSet[] } }) => {
        this.team = data.assets.team;
        EmitterService.get('currentTeam').emit(this.team);
        const currentOrganisationId = this.team?.team_id;
        this.store.dispatch(
          setCurrentOrganisationId({ currentOrganisationId })
        );
        this.cd.markForCheck();
      }
    );
    // this.isOnboardingAddMembers = this.route.snapshot.queryParamMap.has("onboarding") && this.route.snapshot.queryParamMap.get("onboarding") === "members";
    // this.isOnboardingAddMap = this.route.snapshot.queryParamMap.has("onboarding") && this.route.snapshot.queryParamMap.get("onboarding") === "map";
    // this.isOnboardingAddTerminology = this.route.snapshot.queryParamMap.has("onboarding") && this.route.snapshot.queryParamMap.get("onboarding") === "settings";
    // this.isOnboarding = this.isOnboardingAddMap || this.isOnboardingAddMembers || this.isOnboardingAddTerminology;
  }

  ngOnDestroy() {
    EmitterService.get('currentTeam').emit(null);
    this.store.dispatch(
      setCurrentOrganisationId({ currentOrganisationId: undefined })
    );

    this.routeSubscription.unsubscribe();
  }

  onActivate(component: any) {
    switch (component.constructor) {
      case TeamMembersComponent:
        this.pageName = $localize`:@@people:People`;
        break;
      case TeamImportComponent:
        this.pageName = $localize`Import from a .csv file`;
        break;
      case TeamMapsComponent:
        this.pageName = $localize`:@@maps:Maps`;
        break;
      case TeamSettingsComponent:
        this.pageName = $localize`:@@terminology:Name & Terminology`;
        break;
      case TeamIntegrationsComponent:
        this.pageName = $localize`:@@integrations:Integrations`;
        break;
      case TeamBillingComponent:
        this.pageName = $localize`:@@billing:Billing`;
        break;
      default:
        this.pageName = '';
    }
    this.cd.markForCheck();
  }
}
