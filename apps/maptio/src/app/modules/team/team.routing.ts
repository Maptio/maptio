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
        canActivate: [AuthGuard, ActivationGuard, AccessGuard],
        children: [
          { path: '', redirectTo: 'people', pathMatch: 'full' },
          {
            path: 'people',
            component: TeamMembersComponent,
          },
          {
            path: 'import',
            component: TeamImportComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [Permissions.canInviteUser.valueOf()],
            },
          },
          {
            path: 'maps',
            component: TeamMapsComponent,
          },
          {
            path: 'integrations',
            component: TeamIntegrationsComponent,
          },
          {
            path: 'settings',
            component: TeamSettingsComponent,
          },
          {
            path: 'billing',
            component: TeamBillingComponent,
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
