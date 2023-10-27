import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { JwtModule } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';

import { ErrorPageComponent } from './error/error.page';

// Unorganised
import { UnauthorizedComponent } from './401/unauthorized.component';
import { NotFoundComponent } from './404/not-found.component';
import { HeaderComponent } from './header/header.component';
import { OnboardingBannerComponent } from './header/onboarding-banner.component';
import { FooterComponent } from './footer/footer.component';
import { AccessGuard } from './guards/access.guard';
import { ActivationGuard } from './guards/activation.guard';
import { BillingGuard } from './guards/billing.guard';
import { PermissionGuard } from './guards/permission.guard';
import { WorkspaceGuard } from './guards/workspace.guard';
import { DatasetFactory } from './http/map/dataset.factory';
import { TeamFactory } from './http/team/team.factory';
import { UserFactory } from './http/user/user.factory';
import { DeviceDetectorService } from 'ngx-device-detector';
import { LoaderComponent } from '../shared/components/loading/loader.component';
import { NgProgressModule } from 'ngx-progressbar';
import { NgProgressRouterModule } from 'ngx-progressbar/router';
import { OnboardingModule } from '../shared/onboarding.module';
import { OnboardingComponent } from '../shared/components/onboarding/onboarding.component';
import { LoginModule } from 'app/modules/login/login.module';
import { LoginErrorPageComponent } from './login-error/login-error.page';
import { LanguagePickerComponent } from './header/language-picker.component';

export function tokenGetter(): string {
  return localStorage.getItem('maptio_api_token');
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    NgbTooltipModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [],
      },
    }),
    OnboardingModule,
    NgProgressModule,
    NgProgressRouterModule,
    LoginModule,
    HeaderComponent,
    OnboardingBannerComponent,
    FooterComponent,
    LoaderComponent,
    UnauthorizedComponent,
    NotFoundComponent,
    LoginErrorPageComponent,
    ErrorPageComponent,
    LanguagePickerComponent,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    OnboardingComponent,
  ],
  providers: [
    CookieService,
    AccessGuard,
    ActivationGuard,
    BillingGuard,
    PermissionGuard,
    WorkspaceGuard,
    DatasetFactory,
    TeamFactory,
    UserFactory,
    DeviceDetectorService,
  ],
})
export class CoreModule {}
