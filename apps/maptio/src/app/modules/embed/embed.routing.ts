import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmbedComponent } from './pages/embed/embed.page';

const routes: Routes = [
  {
    path: '',
    component: EmbedComponent,
    outlet: 'empty',
    data: { hideUI: true },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmbedRoutingModule {}
