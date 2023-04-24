import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsufficientPermissionsMessageComponent } from './insufficient-permissions-message.component';

@NgModule({
    imports: [CommonModule, InsufficientPermissionsMessageComponent],
    exports: [InsufficientPermissionsMessageComponent]
})
export class PermissionsMessagesModule {}
