import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.page';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { ReactiveFormsModule } from '@angular/forms';
import { PermissionsModule } from '../../shared/permissions.module';
import { HomeRoutingModule } from './home.routing';
import { LoginModule } from '../login/login.module';

import { CreateMapModule } from '@maptio-shared/create-map.module';
import { CreateTeamModule } from '@maptio-shared/create-team.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PermissionsModule,
    CreateMapModule,
    CreateTeamModule,
    HomeRoutingModule,
    LoginModule,
    HomeComponent,
    DashboardComponent,
  ],
  exports: [],
  providers: [],
})
export class HomeModule {}
