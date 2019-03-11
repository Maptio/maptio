import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HelpComponent } from "./pages/help/help.page";
import { HelpRoutingModule } from "./help.routing";
import { OnboardingModule } from "../../shared/onboarding.module";


@NgModule({
    declarations: [
        HelpComponent
    ],
    imports: [CommonModule,
        HelpRoutingModule, 
        OnboardingModule],
    providers: [],
})
export class HelpModule { }