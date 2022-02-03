import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './pages/sign-up/signup.page';
import { LoginComponent } from './pages/login/login.page';
import { AuthorizeComponent } from './pages/authorize/authorize.page';
import { LogoutComponent } from './pages/logout/logout.page';
import { ChangePasswordComponent } from './pages/forgot-password/change-password.page';
import { ProfilePage } from './pages/profile/profile.page';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'signup', component: SignupComponent },

      { path: 'login', component: LoginComponent },
      { path: 'authorize', component: AuthorizeComponent },

      { path: 'logout', component: LogoutComponent },
      { path: 'forgot', component: ChangePasswordComponent },
      {
        path: 'profile/:shortid/:slug',
        component: ProfilePage,
        canActivate: [AuthGuard],
        data: { breadcrumbs: 'Profile' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
