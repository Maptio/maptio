import { DebounceDirective } from './directives/debounce.directive';
import { StickyPopoverDirective } from "./directives/sticky.directive";
import { PermissionsDirective } from "./directives/permission.directive";
import { NgModule } from "@angular/core";



@NgModule({
    imports: [
    ],
    declarations: [
        PermissionsDirective,
        StickyPopoverDirective,
        DebounceDirective
    ],
    providers: [
    ],
    exports: [
        PermissionsDirective,
        StickyPopoverDirective,
        DebounceDirective
    ]
})
export class SharedModule { }