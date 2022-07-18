import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TermsComponent } from './pages/tos/terms.page';
import { PrivacyComponent } from './pages/privacy/privacy.page';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'terms', component: TermsComponent },

      { path: 'privacy', component: PrivacyComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LegalRoutingModule {}
