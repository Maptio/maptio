import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WorkspaceComponent } from './workspace/workspace.component';

const routes: Routes = [
  { path: '', component: WorkspaceComponent },
  { path: 'map/:id', component: WorkspaceComponent },
  { path: 'embed/:id', component: WorkspaceComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
