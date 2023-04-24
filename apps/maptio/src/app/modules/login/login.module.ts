import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SanitizerModule } from '@maptio-shared/sanitizer.module';

import { MemberFormModule } from '@maptio-member-form';

import { LoginRoutingModule } from './login.routing';
import { LogoutComponent } from './pages/logout/logout.page';
import { SignupComponent } from './pages/sign-up/signup.page';
import { ProfilePageComponent } from './pages/profile/profile.page';
import { LoginRedirectDirective } from './login-redirect/login-redirect.directive';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SanitizerModule,
        MemberFormModule,
        LoginRoutingModule,
        LogoutComponent,
        SignupComponent,
        ProfilePageComponent,
        LoginRedirectDirective
    ],
    exports: [LoginRedirectDirective],
    providers: []
})
export class LoginModule {}
