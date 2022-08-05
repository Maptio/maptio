import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { JwtModule } from '@auth0/angular-jwt';

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
import {
  BreadcrumbsModule,
  Breadcrumb,
  BreadcrumbsConfig,
} from '@exalif/ngx-breadcrumbs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { LoaderComponent } from '../shared/components/loading/loader.component';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { MappingSummaryBreadcrumbs } from './breadcrumbs/summary.breadcrumb';
import { OnboardingModule } from '../shared/onboarding.module';
import { OnboardingComponent } from '../shared/components/onboarding/onboarding.component';
import { LoginModule } from 'app/modules/login/login.module';
import { LoginErrorPageComponent } from './login-error/login-error.page';
import { LanguagePickerComponent } from './header/language-picker.component';

export function tokenGetter(): string {
  return localStorage.getItem('maptio_api_token');
}

@NgModule({
  declarations: [
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
    BreadcrumbsModule.forRoot(),
    NgProgressModule,
    NgProgressRouterModule,
    LoginModule,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    OnboardingComponent,
  ],
  providers: [
    AccessGuard,
    ActivationGuard,
    BillingGuard,
    PermissionGuard,
    WorkspaceGuard,
    DatasetFactory,
    TeamFactory,
    UserFactory,
    MappingSummaryBreadcrumbs,
    DeviceDetectorService,
  ],
})
export class CoreModule {
  constructor(breadcrumbsConfig: BreadcrumbsConfig) {
    breadcrumbsConfig.postProcess = (breadcrumbs): Breadcrumb[] => {
      // Ensure that the first breadcrumb always points to home
      let processedBreadcrumbs = breadcrumbs;

      if (breadcrumbs.length && breadcrumbs[0].text !== 'Home') {
        processedBreadcrumbs = [
          {
            text: 'Home',
            path: '',
          },
        ].concat(breadcrumbs);
      }

      return processedBreadcrumbs;
    };
  }
}
