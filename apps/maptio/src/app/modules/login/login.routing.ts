import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

// Old components (before Auth0 SDK integration)
import { SignupComponent } from './pages/sign-up/signup.page';
import { AuthorizeComponent } from './pages/authorize/authorize.page';
import { LogoutComponent } from './pages/logout/logout.page';
import { ChangePasswordComponent } from './pages/forgot-password/change-password.page';
import { ProfilePageComponent } from './pages/profile/profile.page';

// New components (after Auth0 SDK integration)
import { LoginPageComponent } from './pages/login/login.page';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'signup', component: SignupComponent },

      { path: 'login', component: LoginPageComponent },
      { path: 'authorize', component: AuthorizeComponent },

      { path: 'logout', component: LogoutComponent },
      { path: 'forgot', component: ChangePasswordComponent },
      {
        path: 'profile/:shortid/:slug',
        component: ProfilePageComponent,
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
