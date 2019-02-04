import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.page';
import { AccountComponent } from './pages/account/account.page';
import { AuthGuard } from '../../shared/services/guards/auth.guard';


const routes: Routes = [
    {
        path: "", component : HomeComponent,
    },
    {
        path: ":shortid/:slug",
        component: AccountComponent,
        canActivate: [AuthGuard],
        data: { breadcrumbs: "Profile" }
    },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }