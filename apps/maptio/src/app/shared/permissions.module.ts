import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsDirective } from './directives/permission.directive';
import { StickyPopoverDirective } from './directives/sticky.directive';
import { PermissionsService } from './services/permissions/permissions.service';

@NgModule({
    declarations: [
        StickyPopoverDirective, 
        PermissionsDirective
    ],
    imports: [CommonModule],
    exports: [PermissionsDirective, StickyPopoverDirective],
    providers: [
        PermissionsService
    ],
})
export class PermissionsModule { }