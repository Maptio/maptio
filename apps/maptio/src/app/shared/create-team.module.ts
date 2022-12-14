import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

import { PermissionsModule } from './permissions.module';
import { PermissionsMessagesModule } from 'app/modules/permissions-messages/permissions-messages.module';

import { CreateTeamComponent } from './components/cards/create-team/create-team.component';

@NgModule({
  declarations: [CreateTeamComponent],
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
  exports: [CreateTeamComponent],
  providers: [],
})
export class CreateTeamModule {}
