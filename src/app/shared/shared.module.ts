import { StickyPopoverDirective } from "./directives/sticky.directive";
import { PermissionsDirective } from "./directives/permission.directive";
import { NgModule } from "@angular/core";



@NgModule({
    imports: [
    ],
    declarations: [
        PermissionsDirective,
        StickyPopoverDirective
    ],
    providers: [
    ],
    exports: [
        PermissionsDirective,
        StickyPopoverDirective
    ]
})
export class SharedModule { }