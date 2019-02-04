import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.page';
import { AccountComponent } from './pages/account/account.page';
import { AuthGuard } from '../../core/guards/auth.guard';
import { SignupComponent } from './pages/sign-up/signup.page';
import { LoginComponent } from './pages/login/login.page';
import { AuthorizeComponent } from './pages/authorize/authorize.page';
import { LogoutComponent } from './pages/logout/logout.page';
import { ChangePasswordComponent } from './pages/forgot-password/change-password.page';


const routes: Routes = [
    {
        path: "",
        children: [

            { path: "signup", component: SignupComponent },

            { path: "login", component: LoginComponent },
            { path: "authorize", component: AuthorizeComponent },

            { path: "logout", component: LogoutComponent },
            { path: "forgot", component: ChangePasswordComponent },

        ]

    }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }