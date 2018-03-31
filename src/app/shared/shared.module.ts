import { PermissionsDirective } from './directives/permission.directive';
import { HasPermissionDirective } from "./directives/hasPermission.directive";
import { DisableIfNoPermission } from "./directives/disableIfNoPermission.directive";
import { NgModule } from "@angular/core";



@NgModule({
    imports: [
    ],
    declarations: [
        HasPermissionDirective,
        DisableIfNoPermission,
        PermissionsDirective
    ],
    providers: [
    ],
    exports: [
        HasPermissionDirective,
        DisableIfNoPermission,
        PermissionsDirective
    ]
})
export class SharedModule { }