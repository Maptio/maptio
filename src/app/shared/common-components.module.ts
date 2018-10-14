import { NgModule } from "@angular/core";
import { CreateMapComponent } from './components/create-map/create-map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { CardMapComponent } from './components/card-map/card-map.component';
import { RouterModule } from '@angular/router';
import { OnboardingComponent } from "./components/onboarding/onboarding.component";
import { GoogleSignInComponent } from "./components/buttons/google-signin.component";



@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserModule,
        RouterModule
    ],
    declarations: [
        CreateMapComponent,
        CardMapComponent,
        OnboardingComponent,
        GoogleSignInComponent
    ],
    providers: [
    ],
    exports: [
        CreateMapComponent,
        CardMapComponent,
        OnboardingComponent,
        GoogleSignInComponent
    ]
})
export class CommonComponentsModule { }