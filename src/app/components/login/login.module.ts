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
        SignupComponent],
    imports: [CommonModule,
        ReactiveFormsModule,
        CommonComponentsModule,
        RouterModule.forChild(routes)],
    providers: [],
})
export class LoginModule { }