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
import { ProfilePageComponent } from './pages/profile/profile.page';
import { ChangePasswordComponent } from './pages/forgot-password/change-password.page';
import { LoginButtonComponent } from './login-button/login-button.component';



@NgModule({
  declarations: [
    GoogleSignInComponent,
    LoginComponent,
    LogoutComponent,
    SignupComponent,
    AuthorizeComponent,
    ProfilePageComponent,
    ChangePasswordComponent,
    LoginButtonComponent,
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
