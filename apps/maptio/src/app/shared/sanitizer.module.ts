import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
  declarations: [SafePipe],
  imports: [CommonModule],
  exports: [SafePipe],
  providers: [],
})
export class SanitizerModule {}
