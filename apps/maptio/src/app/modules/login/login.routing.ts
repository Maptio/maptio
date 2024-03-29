import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@auth0/auth0-angular';

// Old components (before Auth0 SDK integration)
import { SignupComponent } from './pages/sign-up/signup.page';
import { LogoutComponent } from './pages/logout/logout.page';
import { ProfilePageComponent } from './pages/profile/profile.page';

// New (after Auth0 SDK integration)
import { ActivationGuard } from '@maptio-core/guards/activation.guard';
import { LoginGuard } from './login.guard';
import { SignupGuard } from './signup.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        canActivate: [
          AuthGuard, // Send unauthenticated users to Auth0 login page
          LoginGuard, // Send authenticated users home
        ],
        children: [],
      },

      {
        path: 'signup',
        canActivate: [SignupGuard],
        component: SignupComponent,
      },

      { path: 'logout', component: LogoutComponent },

      {
        path: 'profile/:shortid/:slug',
        component: ProfilePageComponent,
        canActivate: [AuthGuard, ActivationGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
