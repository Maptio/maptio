import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.page';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SanitizerModule } from '../../shared/sanitizer.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PermissionsModule } from '../../shared/permissions.module';
import { CreateMapModule } from '../../shared/create-map.module';
import { HomeRoutingModule } from './home.routing';
import { LoginModule } from '../login/login.module';

@NgModule({
  declarations: [HomeComponent, DashboardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PermissionsModule,
    CreateMapModule,
    SanitizerModule,
    HomeRoutingModule,
    LoginModule,
  ],
  exports: [],
  providers: [],
})
export class HomeModule {}
