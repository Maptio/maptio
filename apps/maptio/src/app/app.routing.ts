import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UnauthorizedComponent } from './core/401/unauthorized.component';
import { NotFoundComponent } from './core/404/not-found.component';

const routes: Routes = [
    {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
    },
    {
        path: "home",
        loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
    },
    {
        path: "teams",
        loadChildren: () => import('./modules/team/team.module').then(m => m.TeamModule),
        data: { breadcrumbs: "Organisations" }
    },
    {
        path: "",
        loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)
    },
    {
        path: "",
        loadChildren: () => import('./modules/payment/payment.module').then(m => m.PaymentModule)
    },
    {
        path: "legal",
        loadChildren: () => import('./modules/legal/legal.module').then(m => m.LegalModule)
    },
    {
        path: "help",
        loadChildren: () => import('./modules/help/help.module').then(m => m.HelpModule)
    },
    {
        path: "map/:mapid/:mapslug",
        loadChildren: () => import('./modules/workspace/workspace.module').then(m => m.WorkspaceModule)
    },
    {
      path: 'share/:id',
      loadChildren: () => import('./modules/embed/embed.module').then(m => m.EmbedModule),
      data: { 'hideUI': true },
    },
    {
      path: 'embed/:id',
      loadChildren: () => import('./modules/embed/embed.module').then(m => m.EmbedModule),
      data: { 'hideUI': true },
    },
    {
        path: "unauthorized",
        component: UnauthorizedComponent
    },
    {
        path: "404",
        component: NotFoundComponent
    },
    {
        path: "**",
        redirectTo: "/404"
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { enableTracing: false, relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }