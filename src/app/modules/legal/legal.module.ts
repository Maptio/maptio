import { PrivacyComponent } from "./pages/privacy/privacy.page";
import { TermsComponent } from "./pages/tos/terms.page";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SanitizerModule } from "../../shared/sanitizer.module";
import { LegalRoutingModule } from "./legal.routing";


@NgModule({
    declarations: [
        PrivacyComponent,
        TermsComponent
    ],
    imports: [CommonModule,
        SanitizerModule,
        LegalRoutingModule],
    providers: [],
})
export class LegalModule { }