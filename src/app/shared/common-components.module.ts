import { NgModule } from "@angular/core";
import { CreateMapComponent } from './components/create-map/create-map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { ColorPickerModule } from "ngx-color-picker";

import { CardMapComponent } from './components/card-map/card-map.component';
import { RouterModule } from '@angular/router';
import { OnboardingComponent } from "./components/onboarding/onboarding.component";
import { GoogleSignInComponent } from "./components/buttons/google-signin.component";
import { ColorPickerComponent } from "./components/color-picker/color-picker.component";
import { CreateTeamComponent } from "./components/create-team/create-team.component";
import { SharedModule } from "./shared.module";
import { CardTeamComponent } from "./components/card-team/card-team.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { IntercomService } from "./services/team/intercom.service";
import { AddMemberComponent } from "./components/onboarding/add-member.component";
import { AddTerminologyComponent } from "./components/onboarding/add-terminology.component";
import { ConfirmationPopoverModule } from "../../../node_modules/angular-confirmation-popover";
import { CommonModalComponent } from "./components/modal/modal.component";
import { InstructionsComponent } from "./components/instructions/instructions.component";



@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserModule,
        RouterModule,
        ColorPickerModule,
        SharedModule,
        ConfirmationPopoverModule,
        NgbModule.forRoot(),
    ],
    declarations: [
        CreateMapComponent,
        CreateTeamComponent,
        CardMapComponent,
        CardTeamComponent, 
        OnboardingComponent,
        InstructionsComponent,
        AddMemberComponent,
        AddTerminologyComponent,
        GoogleSignInComponent,
        ColorPickerComponent,
        CommonModalComponent
    ],
    providers: [
        IntercomService
    ],
    exports: [
        CreateMapComponent,
        CreateTeamComponent,
        CardMapComponent,
        CardTeamComponent,
        OnboardingComponent,
        InstructionsComponent,
        AddMemberComponent,
        AddTerminologyComponent,
        GoogleSignInComponent,
        ColorPickerComponent,
        CommonModalComponent
    ]
})
export class CommonComponentsModule { }