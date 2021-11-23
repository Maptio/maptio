import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SanitizerModule } from '@maptio-shared/sanitizer.module';
import { ImageModule } from '@maptio-shared/image.module';
import { GoogleSignInComponent } from '@maptio-shared/components/buttons/google-signin.component';

import { LoginRoutingModule } from './login.routing';
import { LoginComponent } from './pages/login/login.page';
import { LogoutComponent } from './pages/logout/logout.page';
import { SignupComponent } from './pages/sign-up/signup.page';
import { AuthorizeComponent } from './pages/authorize/authorize.page';
import { ProfilePage } from './pages/profile/profile.page';
import { ChangePasswordComponent } from './pages/forgot-password/change-password.page';

@NgModule({
  declarations: [
    GoogleSignInComponent,
    LoginComponent,
    LogoutComponent,
    SignupComponent,
    AuthorizeComponent,
    ProfilePage,
    ChangePasswordComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SanitizerModule,
    ImageModule,
    LoginRoutingModule,
  ],
  providers: [],
})
export class LoginModule {}
