import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { OnboardingComponent } from "./components/onboarding/onboarding.component";
import { GoogleSignInComponent } from "./components/buttons/google-signin.component";
import { CreateTeamComponent } from "./components/create-team/create-team.component";
import { SharedModule } from "./shared.module";
import { CardTeamComponent } from "./components/card-team/card-team.component";
import { IntercomService } from "./services/team/intercom.service";
import { AddMemberComponent } from "./components/onboarding/add-member.component";
import { AddTerminologyComponent } from "./components/onboarding/add-terminology.component";
import { ConfirmationPopoverModule } from "../../../node_modules/angular-confirmation-popover";
import { CommonModalComponent } from "./components/modal/modal.component";
import { InstructionsComponent } from "./components/instructions/instructions.component";
import { NgbTooltipModule, NgbModalModule, NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { PermissionsModule } from "./permissions.module";
// import { SafePipe } from "../pipes/safe.pipe";



@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        SharedModule,
        ConfirmationPopoverModule,
        NgbTooltipModule, 
        NgbModalModule,
        NgbPopoverModule,
        PermissionsModule
    ],
    declarations: [
        OnboardingComponent,
        InstructionsComponent,
        AddMemberComponent,
        AddTerminologyComponent,
        CommonModalComponent
    ],
    providers: [
        IntercomService
    ],
    exports: [
        OnboardingComponent,
        InstructionsComponent,
        AddMemberComponent,
        AddTerminologyComponent,
        CommonModalComponent
    ]
})
export class CommonComponentsModule { }