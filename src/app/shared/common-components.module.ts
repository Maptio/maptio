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



@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserModule,
        RouterModule,
        ColorPickerModule,
        SharedModule,

        NgbModule.forRoot(),
    ],
    declarations: [
        CreateMapComponent,
        CreateTeamComponent,
        CardMapComponent,
        CardTeamComponent, 
        OnboardingComponent,
        AddMemberComponent,
        AddTerminologyComponent,
        GoogleSignInComponent,
        ColorPickerComponent
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
        AddMemberComponent,
        AddTerminologyComponent,
        GoogleSignInComponent,
        ColorPickerComponent
    ]
})
export class CommonComponentsModule { }