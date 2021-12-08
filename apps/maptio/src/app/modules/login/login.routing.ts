import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@maptio-core/guards/auth.guard';

import { SignupComponent } from './pages/sign-up/signup.page';
import { OldLoginComponent } from './pages/login.old/login.page';
import { AuthorizeComponent } from './pages/authorize/authorize.page';
import { LogoutComponent } from './pages/logout/logout.page';
import { ChangePasswordComponent } from './pages/forgot-password/change-password.page';
import { ProfilePageComponent } from './pages/profile/profile.page';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'signup', component: SignupComponent },

      { path: 'login', component: OldLoginComponent },
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
