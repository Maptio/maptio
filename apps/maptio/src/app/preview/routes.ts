import { Route } from '@angular/router';

import { provideState } from '@ngrx/store';

import { AuthGuard } from '@auth0/auth0-angular';

import { ActivationGuard } from '@maptio-core/guards/activation.guard';
import { AccessGuard } from '@maptio-core/guards/access.guard';
import { BillingGuard } from '@maptio-core/guards/billing.guard';
import { WorkspaceGuard } from '@maptio-core/guards/workspace.guard';

import * as fromWorkspace from '@maptio-old-workspace/+state/workspace.reducer';
import { WorkspaceComponentResolver } from '@maptio-old-workspace/pages/workspace/workspace.resolver';
import { MappingCirclesGradualRevealComponent } from '@maptio-old-workspace/pages/circles-gradual-reveal/mapping.circles-gradual-reveal.component';
import { MappingCirclesExpandedComponent } from '@maptio-old-workspace/pages/circles-expanded/mapping-circles-expanded.component';
import { MappingTreeComponent } from '@maptio-old-workspace/pages/tree/mapping.tree.component';
import { MappingNetworkComponent } from '@maptio-old-workspace/pages/network/mapping.network.component';
import { MappingSummaryComponent } from '@maptio-old-workspace/pages/directory/summary.component';
import { PeopleSummaryComponent } from '@maptio-old-workspace/components/summary/overview/people.component';
import { RolesSummaryComponent } from '@maptio-old-workspace/components/summary/overview/roles.component';
import { VacanciesSummaryComponent } from '@maptio-old-workspace/components/summary/overview/vacancies.component';

import { PreviewComponent } from './preview.component';

export default [
  {
    path: '',
    component: PreviewComponent,
    canActivate: [AuthGuard, ActivationGuard, AccessGuard, BillingGuard],

    resolve: {
      data: WorkspaceComponentResolver,
    },

    providers: [
      WorkspaceComponentResolver,
      provideState({
        name: fromWorkspace.WORKSPACE_FEATURE_KEY,
        reducer: fromWorkspace.workspaceReducer,
      }),
    ],

    children: [
      { path: '', redirectTo: 'circles', pathMatch: 'full' },
      {
        path: 'circles',
        component: MappingCirclesGradualRevealComponent,
        // canActivate: [WorkspaceGuard],
      },
      {
        path: 'expanded',
        component: MappingCirclesExpandedComponent,
        // canActivate: [WorkspaceGuard],
      },
      {
        path: 'tree',
        component: MappingTreeComponent,
        // canActivate: [WorkspaceGuard],
      },
      {
        path: 'network',
        component: MappingNetworkComponent,
        // canActivate: [WorkspaceGuard],
      },
      {
        path: 'directory',
        component: MappingSummaryComponent,
        // canActivate: [WorkspaceGuard],
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
] satisfies Route[];
