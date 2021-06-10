import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { AccessGuard } from '../../core/guards/access.guard';
import { BillingGuard } from '../../core/guards/billing.guard';
import { WorkspaceComponentResolver } from './pages/workspace/workspace.resolver';
import { MappingZoomableComponent } from './pages/circles/mapping.zoomable.component';
import { WorkspaceGuard } from '../../core/guards/workspace.guard';
import { MappingTreeComponent } from './pages/tree/mapping.tree.component';
import { MappingNetworkComponent } from './pages/network/mapping.network.component';
import { MappingSummaryComponent } from './pages/directory/summary.component';
import { MappingSummaryBreadcrumbs } from '../../core/breadcrumbs/summary.breadcrumb';
import { PeopleSummaryComponent } from './components/summary/overview/people.component';
import { RolesSummaryComponent } from './components/summary/overview/roles.component';
import { VacanciesSummaryComponent } from './components/summary/overview/vacancies.component';

const routes: Routes = [{
    path: "",
    data: { breadcrumbs: "{{data.dataset.initiative.name}}" },
    component: WorkspaceComponent,
    canActivate: [AuthGuard, AccessGuard, BillingGuard],
    resolve: {
        data: WorkspaceComponentResolver
    },
    children: [
        { path: "", redirectTo: "circles", pathMatch: "full" },
        { path: "circles", component: MappingZoomableComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Circles" } },
        { path: "tree", component: MappingTreeComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Tree" } },
        { path: "network", component: MappingNetworkComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Network" } },
        {
            path: "directory",
            component: MappingSummaryComponent,
            canActivate: [WorkspaceGuard],
            data: {
                breadcrumbs: MappingSummaryBreadcrumbs
            },
            children: [
                { path: "", redirectTo: "people", pathMatch: "full" },
                { path: "people", component: PeopleSummaryComponent, data: { breadcrumbs: true, text: "People" } },
                { path: "roles", component: RolesSummaryComponent, data: { breadcrumbs: true, text: "Roles" } },
                { path: "vacancies", component: VacanciesSummaryComponent, data: { breadcrumbs: true, text: "Vacancies" } },
            ]
        }

    ]
}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
