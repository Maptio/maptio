import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './pages/login/login.page';
import { LogoutComponent } from './pages/logout/logout.page';
import { AuthorizeComponent } from './pages/authorize/authorize.page';
import { ChangePasswordComponent } from './pages/forgot-password/change-password.page';
import { SignupComponent } from './pages/sign-up/signup.page';
import { ReactiveFormsModule } from '@angular/forms';
import { SanitizerModule } from '../../shared/sanitizer.module';
import { GoogleSignInComponent } from '../../shared/components/buttons/google-signin.component';
import { LoginRoutingModule } from './login.routing';
import { ProfilePage } from './pages/profile/profile.page';
import { ImageModule } from '../../shared/image.module';


@NgModule({
    declarations: [
        LoginComponent,
        LogoutComponent,
        AuthorizeComponent,
        ChangePasswordComponent,
        SignupComponent,
        GoogleSignInComponent,
        ProfilePage],
    imports: [CommonModule,
        ReactiveFormsModule,
        SanitizerModule,
        LoginRoutingModule,
        ImageModule],
    providers: [],
})
export class LoginModule { }