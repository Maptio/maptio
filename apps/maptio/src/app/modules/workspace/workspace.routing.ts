import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@maptio-core/guards/auth.guard';
import { AccessGuard } from '@maptio-core/guards/access.guard';
import { BillingGuard } from '@maptio-core/guards/billing.guard';
import { WorkspaceGuard } from '@maptio-core/guards/workspace.guard';
import { MappingSummaryBreadcrumbs } from '@maptio-core/breadcrumbs/summary.breadcrumb';

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
    data: { breadcrumbs: '{{data.dataset.initiative.name}}' },
    component: WorkspaceComponent,
    canActivate: [AuthGuard, AccessGuard, BillingGuard],
    resolve: {
      data: WorkspaceComponentResolver,
    },
    children: [
      { path: '', redirectTo: 'circles', pathMatch: 'full' },
      {
        path: 'circles',
        component: MappingCirclesGradualRevealComponent,
        canActivate: [WorkspaceGuard],
        data: { breadcrumbs: true, text: 'Circles' },
      },
      {
        path: 'expanded',
        component: MappingZoomableComponent,
        canActivate: [WorkspaceGuard],
        data: { breadcrumbs: true, text: 'Expanded Circles' },
      },
      {
        path: 'tree',
        component: MappingTreeComponent,
        canActivate: [WorkspaceGuard],
        data: { breadcrumbs: true, text: 'Tree' },
      },
      {
        path: 'network',
        component: MappingNetworkComponent,
        canActivate: [WorkspaceGuard],
        data: { breadcrumbs: true, text: 'Network' },
      },
      {
        path: 'directory',
        component: MappingSummaryComponent,
        canActivate: [WorkspaceGuard],
        data: {
          breadcrumbs: MappingSummaryBreadcrumbs,
        },
        children: [
          { path: '', redirectTo: 'people', pathMatch: 'full' },
          {
            path: 'people',
            component: PeopleSummaryComponent,
            data: { breadcrumbs: true, text: 'People' },
          },
          {
            path: 'roles',
            component: RolesSummaryComponent,
            data: { breadcrumbs: true, text: 'Roles' },
          },
          {
            path: 'vacancies',
            component: VacanciesSummaryComponent,
            data: { breadcrumbs: true, text: 'Vacancies' },
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
