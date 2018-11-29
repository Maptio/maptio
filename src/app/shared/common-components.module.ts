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



@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserModule,
        RouterModule,
        ColorPickerModule
    ],
    declarations: [
        CreateMapComponent,
        CardMapComponent,
        OnboardingComponent,
        GoogleSignInComponent,
        ColorPickerComponent
    ],
    providers: [
    ],
    exports: [
        CreateMapComponent,
        CardMapComponent,
        OnboardingComponent,
        GoogleSignInComponent,
        ColorPickerComponent
    ]
})
export class CommonComponentsModule { }