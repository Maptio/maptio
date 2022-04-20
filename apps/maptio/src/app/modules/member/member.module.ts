import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberComponent } from './member.component';


@NgModule({
  declarations: [
    MemberComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MemberComponent
  ],
})
export class MemberModule { }
