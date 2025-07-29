import { Route } from '@angular/router';

import { provideState } from '@ngrx/store';

import { AuthGuard } from '@auth0/auth0-angular';

import { ActivationGuard } from '@maptio-core/guards/activation.guard';
import { AccessGuard } from '@maptio-core/guards/access.guard';
import { BillingGuard } from '@maptio-core/guards/billing.guard';

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

import { WorkspaceComponent } from './workspace.component';

export default [
  {
    path: '',
    component: WorkspaceComponent,
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
      {
        path: '',
        redirectTo: 'expanded-circles',
        pathMatch: 'full',
      },
      {
        path: 'circles',
        redirectTo: 'expanded-circles',
      },
      {
        path: 'expanded-circles',
        component: MappingCirclesExpandedComponent,
      },
      {
        path: 'expanded',
        redirectTo: 'expanded-circles',
      },
      {
        path: 'covered-circles',
        component: MappingCirclesGradualRevealComponent,
      },
      {
        path: 'covered',
        redirectTo: 'covered-circles',
      },
      {
        path: 'tree',
        component: MappingTreeComponent,
      },
      {
        path: 'network',
        component: MappingNetworkComponent,
      },
      {
        path: 'directory',
        component: MappingSummaryComponent,
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
