import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HelpComponent } from "./pages/help/help.page";
import { HelpRoutingModule } from "./help.routing";


@NgModule({
    declarations: [
        HelpComponent
    ],
    imports: [CommonModule,
        HelpRoutingModule
        ],
    providers: [],
})
export class HelpModule { }