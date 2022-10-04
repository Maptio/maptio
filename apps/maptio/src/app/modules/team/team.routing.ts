import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

import { ActivationGuard } from '@maptio-core/guards/activation.guard';
import { AccessGuard } from '@maptio-core/guards/access.guard';
import { PermissionGuard } from '@maptio-core/guards/permission.guard';
import { Permissions } from '@maptio-shared/model/permission.data';

import { TeamListComponent } from './pages/team-list/team-list.component';
import { TeamListComponentResolver } from './pages/team-list/team-list.resolver';
import { TeamComponentResolver } from './pages/team-single/team.resolver';
import { TeamComponent } from './pages/team-single/team.component';
import { TeamMembersComponent } from './pages/team-members/members.component';
import { TeamImportComponent } from './pages/team-import/import.component';
import { TeamMapsComponent } from './pages/team-maps/maps.component';
import { TeamIntegrationsComponent } from './pages/team-integrations/integrations.component';
import { TeamSettingsComponent } from './pages/team-settings/settings.component';
import { TeamBillingComponent } from './pages/team-billing/billing.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: TeamListComponent,
        canActivate: [AuthGuard, ActivationGuard],
        resolve: {
          teams: TeamListComponentResolver,
        },
      },
      {
        path: ':teamid/:slug',
        resolve: {
          assets: TeamComponentResolver,
        },
        component: TeamComponent,
        data: { breadcrumbs: '{{assets.team.name}}' },
        canActivate: [AuthGuard, ActivationGuard, AccessGuard],
        children: [
          { path: '', redirectTo: 'people', pathMatch: 'full' },
          {
            path: 'people',
            component: TeamMembersComponent,
            data: { breadcrumbs: true, text: $localize`:@@people:People` },
          },
          {
            path: 'import',
            component: TeamImportComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [Permissions.canInviteUser.valueOf()],
              breadcrumbs: true,
              text: 'Import',
            },
          },
          {
            path: 'maps',
            component: TeamMapsComponent,
            data: { breadcrumbs: true, text: $localize`:@@maps:Maps` },
          },
          {
            path: 'integrations',
            component: TeamIntegrationsComponent,
            data: {
              breadcrumbs: true,
              text: $localize`:@@integrations:Integrations`,
            },
          },
          {
            path: 'settings',
            component: TeamSettingsComponent,
            data: {
              breadcrumbs: true,
              text: $localize`:@@terminology:Name & Terminology`,
            },
          },
          {
            path: 'billing',
            component: TeamBillingComponent,
            data: { breadcrumbs: true, text: $localize`:@@billing:Billing` },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamRoutingModule {}
