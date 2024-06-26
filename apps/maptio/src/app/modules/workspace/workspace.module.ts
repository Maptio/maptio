import { MappingComponent } from './components/canvas/mapping.component';
import { MappingNetworkComponent } from './pages/network/mapping.network.component';
import { MappingTreeComponent } from './pages/tree/mapping.tree.component';
import { MappingZoomableComponent } from './pages/circles/mapping.zoomable.component';
import { MappingCirclesGradualRevealComponent } from './pages/circles-gradual-reveal/mapping.circles-gradual-reveal.component';
import { MappingCirclesExpandedComponent } from './pages/circles-expanded/mapping-circles-expanded.component';

import { ColorHueModule } from 'ngx-color/hue'; // <color-hue-picker></color-hue-picker>
import { SharedModule } from '../../shared/shared.module';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { MarkdownModule } from 'ngx-markdown';
import { FilterTagsComponent } from './components/filtering/tags.component';
import { SearchComponent } from './components/searching/search.component';
import { WorkspaceGuard } from '../../core/guards/workspace.guard';
import { WorkspaceComponentResolver } from './pages/workspace/workspace.resolver';
import { InitiativeComponent } from './components/data-entry/details/initiative.component';
import { BuildingComponent } from './components/data-entry/hierarchy/building.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BillingGuard } from '../../core/guards/billing.guard';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { MappingSummaryComponent } from './pages/directory/summary.component';
import { PeopleSummaryComponent } from './components/summary/overview/people.component';
import { PersonalSummaryComponent } from './components/summary/overview/personal.component';
import { RolesSummaryComponent } from './components/summary/overview/roles.component';
import { VacanciesSummaryComponent } from './components/summary/overview/vacancies.component';
import { StripMarkdownPipe } from '../../shared/pipes/strip-markdown.pipe';
import { EllipsisPipe } from '../../shared/pipes/ellipsis.pipe';
import { PersonalCardComponent } from './components/summary/tab/card.component';
import { RoleHoldersInInitiativeComponent } from './components/summary/tab/role-holders-in-initiative.component';
import {
  NgbNavModule,
  NgbTooltipModule,
  NgbTypeaheadModule,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerComponent } from '../../shared/components/color-picker/color-picker.component';
import { PermissionsModule } from '../../shared/permissions.module';
import { DataService } from './services/data.service';
import { RoleLibraryService } from './services/role-library.service';
import { MapSettingsService } from './services/map-settings.service';
import { EditTagsComponent } from './components/data-entry/tags/edit-tags.component';
import { UIService } from './services/ui.service';
import { WorkspaceRoutingModule } from './workspace.routing';
import { AnalyticsModule } from '../../core/analytics.module';
import { InitiativeInputNameComponent } from './components/data-entry/details/parts/name/initiative-input-name.component';
import { InitiativeListTagsComponent } from './components/data-entry/details/parts/tags/list-tags.component';
import { InitiativeAuthoritySelectComponent } from './components/data-entry/details/parts/authority/authority-select.component';
import { InitiativeDescriptionTextareaComponent } from './components/data-entry/details/parts/description/description-textarea.component';
import { CommonAutocompleteComponent } from '../../shared/components/autocomplete/autocomplete.component';
import { InitiativeHelpersSelectComponent } from './components/data-entry/details/parts/helpers/helpers-select.component';
import { InitiativeHelperInputComponent } from './components/data-entry/details/parts/helpers/helper-input.component';
import { InitiativeHelperRoleSelectComponent } from './components/data-entry/details/parts/helpers/helper-role-select.component';
import { InitiativeHelperRoleComponent } from './components/data-entry/details/parts/helpers/helper-role.component';
import { InitiativeHelperRoleInputComponent } from './components/data-entry/details/parts/helpers/helper-role-input.component';
import { InitiativeVacanciesInputComponent } from './components/data-entry/details/parts/helpers/vacancies-input.component';
import { CommonTextareaComponent } from '../../shared/components/textarea/textarea.component';
import { InitiativeHelperPrivilegeComponent } from './components/data-entry/details/parts/helpers/helper-toggle-privilege.component';
import { InitiativeInputSizeComponent } from './components/data-entry/details/parts/size/input-size.component';

import { CircleMapModule } from '@maptio-circle-map/circle-map.module';
import { CircleMapExpandedModule } from '@maptio-circle-map-expanded/circle-map-expanded.module';
import { MemberFormModule } from '@maptio-member-form';

import { SharingComponent } from './components/sharing/sharing.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromWorkspace from './+state/workspace.reducer';
import { WorkspaceEffects } from './+state/workspace.effects';
import { WorkspaceFacade } from './+state/workspace.facade';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WorkspaceRoutingModule,
    AnalyticsModule,
    MarkdownModule.forChild(),
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger',
      cancelButtonType: 'link',
    }),
    SharedModule,
    NgbNavModule,
    NgbTooltipModule,
    NgbTypeaheadModule,
    NgbPopoverModule,
    ColorHueModule,
    PermissionsModule,
    CircleMapModule,
    CircleMapExpandedModule,
    MemberFormModule,
    BuildingComponent,
    InitiativeComponent,
    InitiativeInputNameComponent,
    InitiativeListTagsComponent,
    InitiativeAuthoritySelectComponent,
    InitiativeDescriptionTextareaComponent,
    InitiativeHelpersSelectComponent,
    InitiativeHelperInputComponent,
    InitiativeHelperRoleSelectComponent,
    InitiativeHelperRoleComponent,
    InitiativeHelperRoleInputComponent,
    InitiativeVacanciesInputComponent,
    InitiativeHelperPrivilegeComponent,
    MappingComponent,
    MappingZoomableComponent,
    MappingCirclesGradualRevealComponent,
    MappingCirclesExpandedComponent,
    MappingTreeComponent,
    MappingNetworkComponent,
    MappingSummaryComponent,
    PeopleSummaryComponent,
    PersonalSummaryComponent,
    PersonalCardComponent,
    RolesSummaryComponent,
    VacanciesSummaryComponent,
    RoleHoldersInInitiativeComponent,
    InitiativeInputSizeComponent,
    SearchComponent,
    FilterTagsComponent,
    TooltipComponent,
    ContextMenuComponent,
    ColorPickerComponent,
    EditTagsComponent,
    CommonAutocompleteComponent,
    CommonTextareaComponent,
    StripMarkdownPipe,
    EllipsisPipe,
    SharingComponent,
    StoreModule.forFeature(
      fromWorkspace.WORKSPACE_FEATURE_KEY,
      fromWorkspace.workspaceReducer
    ),
    EffectsModule.forRoot([]),
    EffectsModule.forFeature([WorkspaceEffects]),
  ],
  providers: [
    BillingGuard,
    WorkspaceGuard,
    UIService,
    MapSettingsService,
    WorkspaceComponentResolver,
    WorkspaceFacade,
  ],
})
export class WorkspaceModule {}
