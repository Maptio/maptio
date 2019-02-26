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
        loadChildren: "./modules/home/home.module#HomeModule"
    },
    {
        path: "teams",
        loadChildren: "./modules/team/team.module#TeamModule",
        data: { breadcrumbs: "Organisations" }
    },
    {
        path: "",
        loadChildren: "./modules/login/login.module#LoginModule"
    },
    {
        path: "",
        loadChildren: "./modules/payment/payment.module#PaymentModule"
    },
    {
        path: "legal",
        loadChildren: "./modules/legal/legal.module#LegalModule"
    },
    {
        path: "help",
        loadChildren: "./modules/help/help.module#HelpModule"
    },
    {
        path: "map/:mapid/:mapslug",
        loadChildren: "./modules/workspace/workspace.module#WorkspaceModule"
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
    imports: [RouterModule.forRoot(routes, {enableTracing:true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }