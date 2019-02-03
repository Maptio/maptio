import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OnboardingComponent } from "./components/onboarding/onboarding.component";
import { SharedModule } from "./shared.module";
import { IntercomService } from "./services/team/intercom.service";
import { AddMemberComponent } from "./components/onboarding/add-member.component";
import { AddTerminologyComponent } from "./components/onboarding/add-terminology.component";
import { CommonModalComponent } from "./components/modal/modal.component";
import { InstructionsComponent } from "./components/instructions/instructions.component";
import { NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { InstructionsService } from "./components/instructions/instructions.service";
import { OnboardingService } from "./components/onboarding/onboarding.service";


@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        SharedModule,
        NgbModalModule
    ],
    declarations: [
        OnboardingComponent,
        InstructionsComponent,
        AddMemberComponent,
        AddTerminologyComponent,
        CommonModalComponent
    ],
    providers: [
        IntercomService,InstructionsService, OnboardingService
    ],
    exports: [
        OnboardingComponent,
        InstructionsComponent,
        AddMemberComponent,
        AddTerminologyComponent,
        CommonModalComponent
    ]
})
export class OnboardingModule { }