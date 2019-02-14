
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
import { InstructionsComponent } from '../../shared/components/instructions/instructions.component';
import { OnboardingComponent } from '../../shared/components/onboarding/onboarding.component';

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
    entryComponents : [InstructionsComponent, OnboardingComponent]
})
export class HomeModule { }