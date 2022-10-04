import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateMapComponent } from './components/cards/create-map/create-map.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MapCardComponent } from './components/cards/map/map-card.component';
import { RouterModule } from '@angular/router';
import { PermissionsModule } from './permissions.module';
import { PermissionsMessagesModule } from 'app/modules/permissions-messages/permissions-messages.module';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

@NgModule({
  declarations: [CreateMapComponent, MapCardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PermissionsModule,
    PermissionsMessagesModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger',
      cancelButtonType: 'link',
    }),
  ],
  exports: [CreateMapComponent, MapCardComponent],
  providers: [],
})
export class CreateMapModule {}
