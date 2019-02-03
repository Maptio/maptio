import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsDirective } from './directives/permission.directive';

@NgModule({
    declarations: [PermissionsDirective],
    imports: [ CommonModule ],
    exports: [PermissionsDirective],
    providers: [],
})
export class PermissionsModule {}