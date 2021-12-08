import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SanitizerModule } from '@maptio-shared/sanitizer.module';
import { ImageModule } from '@maptio-shared/image.module';
import { GoogleSignInComponent } from '@maptio-shared/components/buttons/google-signin.component';

import { MemberFormModule } from "@maptio-member-form";

import { LoginRoutingModule } from './login.routing';
import { OldLoginComponent } from './pages/login.old/login.page';
import { LogoutComponent } from './pages/logout/logout.page';
import { SignupComponent } from './pages/sign-up/signup.page';
import { AuthorizeComponent } from './pages/authorize/authorize.page';
import { ProfilePageComponent } from './pages/profile/profile.page';
import { ChangePasswordComponent } from './pages/forgot-password/change-password.page';
import { LoginButtonComponent } from './login-button/login-button.component';
import { LoginPageComponent } from './pages/login/login.page';



@NgModule({
  declarations: [
    GoogleSignInComponent,
    OldLoginComponent,
    LogoutComponent,
    SignupComponent,
    AuthorizeComponent,
    ProfilePageComponent,
    ChangePasswordComponent,
    LoginButtonComponent,
    LoginPageComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SanitizerModule,
    ImageModule,
    MemberFormModule,
    LoginRoutingModule,
  ],
  exports: [
    LoginButtonComponent,
  ],
  providers: [],
})
export class LoginModule {}
