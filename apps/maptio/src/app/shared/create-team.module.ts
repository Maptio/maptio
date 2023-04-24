import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

import { PermissionsModule } from './permissions.module';

import { CreateTeamComponent } from './components/cards/create-team/create-team.component';

@NgModule({
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
        CreateTeamComponent
    ],
    exports: [CreateTeamComponent],
    providers: []
})
export class CreateTeamModule {}
