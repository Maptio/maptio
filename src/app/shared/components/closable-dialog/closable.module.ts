import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClosableComponent } from './closable.component';
import { InsertionDirective } from './insertion.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [ClosableComponent, InsertionDirective],
  entryComponents: [ClosableComponent]
})
export class ClosableModule {}