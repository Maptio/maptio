import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpComponent } from './pages/help/help.page';
import { HelpRoutingModule } from './help.routing';

@NgModule({
  imports: [CommonModule, HelpRoutingModule, HelpComponent],
  providers: [],
})
export class HelpModule {}
