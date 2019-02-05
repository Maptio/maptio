import "file-saver"

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.page';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SanitizerModule } from '../../shared/sanitizer.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PermissionsModule } from '../../shared/permissions.module';
import { CreateMapModule } from "../../shared/create-map.module";
import { OnboardingModule } from "../../shared/onboarding.module";
import { HomeRoutingModule } from "./home.routing";

@NgModule({
    declarations: [
        HomeComponent,
        DashboardComponent
    ],
    imports: [CommonModule,
        ReactiveFormsModule,
        PermissionsModule,
         CreateMapModule,
        SanitizerModule,
        OnboardingModule,
        HomeRoutingModule
    ],
    exports: [],
    providers: [],
})
export class HomeModule { }