import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

import { PermissionsModule } from '@maptio-shared/permissions.module';

import { MemberFormComponent } from './member-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger',
      cancelButtonType: 'link',
    }),
    PermissionsModule,
    MemberFormComponent,
  ],
  exports: [MemberFormComponent],
})
export class MemberFormModule {}
