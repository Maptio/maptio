import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LogoutComponent } from './logout.component';
import { AuthorizeComponent } from './authorize.component';
import { ChangePasswordComponent } from './change-password.component';
import { SignupComponent } from './signup.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonComponentsModule } from '../../shared/common-components.module';
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
        CommonComponentsModule,
        SanitizerModule,
        RouterModule.forChild(routes)],
    providers: [],
})
export class LoginModule { }