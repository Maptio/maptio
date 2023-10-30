import { TeamIntegrationsComponent } from './pages/team-integrations/integrations.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { KeysPipe } from '../../shared/pipes/keys.pipe';
import { SharedModule } from '../../shared/shared.module';
import { TeamListComponent } from './pages/team-list/team-list.component';
import { TeamListComponentResolver } from './pages/team-list/team-list.resolver';
import { TeamImportComponent } from './pages/team-import/import.component';
import { TeamMapsComponent } from './pages/team-maps/maps.component';
import { TeamMembersComponent } from './pages/team-members/members.component';
import { TeamSettingsComponent } from './pages/team-settings/settings.component';
import { TeamComponent } from './pages/team-single/team.component';
import { TeamComponentResolver } from './pages/team-single/team.resolver';
import { TeamBillingComponent } from './pages/team-billing/billing.component';
import { MemberSingleComponent } from './components/member-details/member-single.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { PermissionsModule } from '../../shared/permissions.module';
import { CardTeamComponent } from '../../shared/components/cards/team/card-team.component';
import { CreateTeamModule } from '../../shared/create-team.module';
import { CreateMapModule } from '../../shared/create-map.module';
import { TeamRoutingModule } from './team.routing';
import { PaymentModule } from '../payment/payment.module';

import { MemberFormModule } from '@maptio-member-form';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TeamRoutingModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger',
      cancelButtonType: 'secondary',
    }),
    SharedModule,
    NgbTooltipModule,
    PermissionsModule,
    CreateTeamModule,
    CreateMapModule,
    MemberFormModule,
    PaymentModule,
    CardTeamComponent,
    TeamComponent,
    TeamListComponent,
    TeamMembersComponent,
    MemberSingleComponent,
    TeamSettingsComponent,
    TeamImportComponent,
    TeamIntegrationsComponent,
    TeamBillingComponent,
    TeamMapsComponent,
    KeysPipe,
  ],
  providers: [TeamComponentResolver, TeamListComponentResolver],
})
export class TeamModule {}
