import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

import { ActivationGuard } from '@maptio-core/guards/activation.guard';
import { AccessGuard } from '@maptio-core/guards/access.guard';
import { BillingGuard } from '@maptio-core/guards/billing.guard';
import { WorkspaceGuard } from '@maptio-core/guards/workspace.guard';

import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { WorkspaceComponentResolver } from './pages/workspace/workspace.resolver';
import { MappingZoomableComponent } from './pages/circles/mapping.zoomable.component';
import { MappingCirclesGradualRevealComponent } from './pages/circles-gradual-reveal/mapping.circles-gradual-reveal.component';
import { MappingTreeComponent } from './pages/tree/mapping.tree.component';
import { MappingNetworkComponent } from './pages/network/mapping.network.component';
import { MappingSummaryComponent } from './pages/directory/summary.component';
import { PeopleSummaryComponent } from './components/summary/overview/people.component';
import { RolesSummaryComponent } from './components/summary/overview/roles.component';
import { VacanciesSummaryComponent } from './components/summary/overview/vacancies.component';

const routes: Routes = [
  {
    path: '',
    component: WorkspaceComponent,
    canActivate: [AuthGuard, ActivationGuard, AccessGuard, BillingGuard],
    resolve: {
      data: WorkspaceComponentResolver,
    },
    children: [
      { path: '', redirectTo: 'circles', pathMatch: 'full' },
      {
        path: 'circles',
        component: MappingCirclesGradualRevealComponent,
        canActivate: [WorkspaceGuard],
      },
      {
        path: 'expanded',
        component: MappingZoomableComponent,
        canActivate: [WorkspaceGuard],
      },
      {
        path: 'tree',
        component: MappingTreeComponent,
        canActivate: [WorkspaceGuard],
      },
      {
        path: 'network',
        component: MappingNetworkComponent,
        canActivate: [WorkspaceGuard],
      },
      {
        path: 'directory',
        component: MappingSummaryComponent,
        canActivate: [WorkspaceGuard],
        children: [
          { path: '', redirectTo: 'people', pathMatch: 'full' },
          {
            path: 'people',
            component: PeopleSummaryComponent,
          },
          {
            path: 'roles',
            component: RolesSummaryComponent,
          },
          {
            path: 'vacancies',
            component: VacanciesSummaryComponent,
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
export class WorkspaceRoutingModule {}
