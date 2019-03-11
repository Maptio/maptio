import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnauthorizedComponent } from './401/unauthorized.component';
import { NotFoundComponent } from './404/not-found.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { Auth } from './authentication/auth.service';
import { AuthConfiguration } from './authentication/auth.config';
import { AccessGuard } from './guards/access.guard';
import { AuthGuard } from './guards/auth.guard';
import { BillingGuard } from './guards/billing.guard';
import { PermissionGuard } from './guards/permission.guard';
import { WorkspaceGuard } from './guards/workspace.guard';
import { DatasetFactory } from './http/map/dataset.factory';
import { TeamFactory } from './http/team/team.factory';
import { UserFactory } from './http/user/user.factory';
import { AuthHttp } from 'angular2-jwt';
import { authHttpServiceFactory } from '../shared/services/auth/auth.module';
import { Http, RequestOptions, HttpModule } from '@angular/http';
import { BreadcrumbsModule, Breadcrumb, BreadcrumbsConfig } from '@exalif/ngx-breadcrumbs';
import { RouterModule } from '@angular/router';
import { DeviceDetectorModule, DeviceDetectorService } from 'ngx-device-detector';
import { LoaderComponent } from '../shared/components/loading/loader.component';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { MappingSummaryBreadcrumbs } from './breadcrumbs/summary.breadcrumb';
import { HttpFactoryModule } from './interceptors/httpInterceptor';
import { OnboardingModule } from '../shared/onboarding.module';
import { InstructionsComponent } from '../shared/components/instructions/instructions.component';
import { OnboardingComponent } from '../shared/components/onboarding/onboarding.component';

@NgModule({
    declarations: [
        UnauthorizedComponent,
        NotFoundComponent,
        HeaderComponent,
        FooterComponent,
        LoaderComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        HttpModule,
        HttpFactoryModule,
        OnboardingModule,
        BreadcrumbsModule.forRoot(),
        DeviceDetectorModule.forRoot(),
        NgProgressModule.forRoot(),
        NgProgressRouterModule,
    ],
    exports: [
        HeaderComponent,
        FooterComponent,
        LoaderComponent,
        DeviceDetectorModule
    ],
    providers: [
        Auth, AuthConfiguration,
        AccessGuard, AuthGuard, BillingGuard, PermissionGuard, WorkspaceGuard,
        DatasetFactory, TeamFactory, UserFactory,
        {
            provide: AuthHttp,
            useFactory: authHttpServiceFactory,
            deps: [Http, RequestOptions]
        },
        MappingSummaryBreadcrumbs,
        DeviceDetectorService

    ],
    entryComponents : [InstructionsComponent, OnboardingComponent]
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
                        path: ''
                    }
                ].concat(breadcrumbs);
            }

            return processedBreadcrumbs;
        };
    }

}