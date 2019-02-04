import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './pages/login/login.page';
import { LogoutComponent } from './pages/logout/logout.page';
import { AuthorizeComponent } from './pages/authorize/authorize.page';
import { ChangePasswordComponent } from './pages/forgot-password/change-password.page';
import { SignupComponent } from './pages/sign-up/signup.page';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SanitizerModule } from '../../shared/sanitizer.module';
import { GoogleSignInComponent } from '../../shared/components/buttons/google-signin.component';

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
    declarations: [
        LoginComponent, 
        LogoutComponent, 
        AuthorizeComponent, 
        ChangePasswordComponent, 
        SignupComponent,
        GoogleSignInComponent],
    imports: [CommonModule,
        ReactiveFormsModule,
        SanitizerModule,
        RouterModule.forChild(routes)],
    providers: [],
})
export class LoginModule { }