import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PermissionsModule } from '@maptio-shared/permissions.module';
import { ImageModule } from '@maptio-shared/image.module';

import { MemberFormComponent } from './member-form.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PermissionsModule,
    ImageModule,
  ],
  declarations: [
    MemberFormComponent
  ],
  exports: [
    MemberFormComponent
  ]
})
export class MemberFormModule { }
