import "file-saver"
import "angular-confirmation-popover";
import "d3-hierarchy"


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule } from '../../../../node_modules/@angular/router';
import { SanitizerModule } from '../../shared/sanitizer.module';
import { ReactiveFormsModule } from '../../../../node_modules/@angular/forms';
import { PermissionsModule } from '../../shared/permissions.module';
import { AccountComponent } from "../account/account.component";
import { ImageModule } from "../../shared/image.module";
import { AuthGuard } from "../../shared/services/guards/auth.guard";
import { CreateMapModule } from "../../shared/create-map.module";
import { OnboardingModule } from "../../shared/onboarding.module";
import { URIService } from "../../shared/services/uri.service";
import { TeamService } from "../../shared/services/team/team.service";
import { MapService } from "../../shared/services/map/map.service";
import { FileService } from "../../shared/services/file/file.service";

@NgModule({
    declarations: [
        HomeComponent,
        DashboardComponent,
        AccountComponent
        
    ],
    imports: [CommonModule,
        ReactiveFormsModule,
        PermissionsModule,
        ImageModule,
        CreateMapModule,
        SanitizerModule,
        OnboardingModule,
        RouterModule.forChild([
            {
                path: "", component : HomeComponent,
            },
            {
                path: ":shortid/:slug",
                component: AccountComponent,
                canActivate: [AuthGuard],
                data: { breadcrumbs: "Profile" }
            },
        ])],
    exports: [],
    providers: [
        URIService,TeamService, MapService, FileService 
    ],
})
export class HomeModule { }