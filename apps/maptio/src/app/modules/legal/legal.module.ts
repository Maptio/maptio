import { PrivacyComponent } from './pages/privacy/privacy.page';
import { TermsComponent } from './pages/tos/terms.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LegalRoutingModule } from './legal.routing';

@NgModule({
  imports: [CommonModule, LegalRoutingModule, PrivacyComponent, TermsComponent],
  providers: [],
})
export class LegalModule {}
