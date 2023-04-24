import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
    imports: [CommonModule, SafePipe],
    exports: [SafePipe],
    providers: []
})
export class SanitizerModule {}
