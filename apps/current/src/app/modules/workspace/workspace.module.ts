import { ColorHueModule } from 'ngx-color/hue'; // <color-hue-picker></color-hue-picker>
import { ShareSlackComponent } from "./components/sharing/slack.component";
import { SharedModule } from "../../shared/shared.module";
import { ConfirmationPopoverModule } from "angular-confirmation-popover";
import { MarkdownModule, } from "ngx-markdown";
import { FilterTagsComponent } from "./components/filtering/tags.component";
import { SearchComponent } from "./components/searching/search.component";
import { TreeModule } from "@circlon/angular-tree-component";
import { WorkspaceGuard } from "../../core/guards/workspace.guard";
import { WorkspaceComponent } from "./pages/workspace/workspace.component";
import { WorkspaceComponentResolver } from "./pages/workspace/workspace.resolver";
import { MappingNetworkComponent } from "./pages/network/mapping.network.component";
import { MappingTreeComponent } from "./pages/tree/mapping.tree.component";
import { MappingZoomableComponent } from "./pages/circles/mapping.zoomable.component";
import { MappingComponent } from "./components/canvas/mapping.component";
import { InitiativeComponent } from "./components/data-entry/details/initiative.component";
import { InitiativeNodeComponent } from "./components/data-entry/node/initiative.node.component";
import { BuildingComponent } from "./components/data-entry/hierarchy/building.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BillingGuard } from "../../core/guards/billing.guard";
import { TooltipComponent } from "./components/tooltip/tooltip.component";
import { ContextMenuComponent } from "./components/context-menu/context-menu.component";
import { MappingSummaryComponent } from "./pages/directory/summary.component";
import { PeopleSummaryComponent } from "./components/summary/overview/people.component";
import { PersonalSummaryComponent } from "./components/summary/overview/personal.component";
import { RolesSummaryComponent } from "./components/summary/overview/roles.component";
import { VacanciesSummaryComponent } from "./components/summary/overview/vacancies.component";
import { OnboardingComponent } from "../../shared/components/onboarding/onboarding.component";
import { InstructionsComponent } from "../../shared/components/instructions/instructions.component";
import { StripMarkdownPipe } from "../../shared/pipes/strip-markdown.pipe";
import { EllipsisPipe } from "../../shared/pipes/ellipsis.pipe";
import { PersonalCardComponent } from "./components/summary/tab/card.component";
import { RoleHoldersInInitiativeComponent } from "./components/summary/tab/role-holders-in-initiative.component";
import { SlackService } from "./components/sharing/slack.service";
import { NgbTooltipModule, NgbTypeaheadModule, NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { ColorPickerComponent } from "../../shared/components/color-picker/color-picker.component";
import { PermissionsModule } from "../../shared/permissions.module";
import { DataService } from "./services/data.service";
import { RoleLibraryService } from "./services/role-library.service";
import { MapSettingsService } from "./services/map-settings.service";
import { EditTagsComponent } from "./components/data-entry/tags/edit-tags.component";
import { UIService } from "./services/ui.service";
import { ColorService } from "./services/color.service";
import { WorkspaceRoutingModule } from "./workspace.routing";
import { AnalyticsModule } from '../../core/analytics.module';
import { InitiativeInputNameComponent } from './components/data-entry/details/parts/name/input-name.component';
import { InitiativeListTagsComponent } from './components/data-entry/details/parts/tags/list-tags.component';
import { InitiativeAuthoritySelectComponent } from './components/data-entry/details/parts/authority/authority-select.component';
import { InitiativeDescriptionTextareaComponent } from './components/data-entry/details/parts/description/description-textarea.component';
import { CommonAutocompleteComponent } from '../../shared/components/autocomplete/autocomplete.component';
import { InitiativeHelpersSelectComponent } from './components/data-entry/details/parts/helpers/helpers-select.component';
import { InitiativeHelperInputComponent } from "./components/data-entry/details/parts/helpers/helper-input.component";
import { InitiativeHelperRoleSelectComponent } from "./components/data-entry/details/parts/helpers/helper-role-select.component";
import { InitiativeHelperRoleComponent } from "./components/data-entry/details/parts/helpers/helper-role.component";
import { InitiativeHelperRoleInputComponent } from './components/data-entry/details/parts/helpers/helper-role-input.component';
import { InitiativeVacanciesInputComponent } from './components/data-entry/details/parts/helpers/vacancies-input.component';
import { CommonTextareaComponent } from '../../shared/components/textarea/textarea.component';
import { InitiativeHelperPrivilegeComponent } from './components/data-entry/details/parts/helpers/helper-toggle-privilege.component';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        WorkspaceRoutingModule,
        TreeModule,
        AnalyticsModule,
        MarkdownModule.forChild(),
        ConfirmationPopoverModule.forRoot({
            confirmButtonType: "danger",
            cancelButtonType: "link"
        }),
        SharedModule,
        NgbTooltipModule,
        NgbTypeaheadModule,
        NgbPopoverModule,
        ColorHueModule,
        PermissionsModule
    ],
    declarations: [
        WorkspaceComponent,
        BuildingComponent, InitiativeNodeComponent,
        InitiativeComponent,
        InitiativeInputNameComponent, InitiativeListTagsComponent,
        InitiativeAuthoritySelectComponent,
        InitiativeDescriptionTextareaComponent,
        InitiativeHelpersSelectComponent,
        InitiativeHelperInputComponent,
        InitiativeHelperRoleSelectComponent,
        InitiativeHelperRoleComponent,
        InitiativeHelperRoleInputComponent,
        InitiativeVacanciesInputComponent,
        InitiativeHelperPrivilegeComponent,
        MappingComponent, MappingZoomableComponent, MappingTreeComponent, MappingNetworkComponent,
        MappingSummaryComponent,
        PeopleSummaryComponent,
        PersonalSummaryComponent,
        PersonalCardComponent,
        RolesSummaryComponent,
        VacanciesSummaryComponent,
        RoleHoldersInInitiativeComponent,

        SearchComponent, FilterTagsComponent, ShareSlackComponent,
        TooltipComponent, ContextMenuComponent,
        ColorPickerComponent,
        EditTagsComponent,
        CommonAutocompleteComponent,
        CommonTextareaComponent,

        StripMarkdownPipe,
        EllipsisPipe
    ],
    providers: [BillingGuard, WorkspaceGuard, UIService, ColorService,
        SlackService, DataService, RoleLibraryService, MapSettingsService,
        WorkspaceComponentResolver
    ]
})
export class WorkspaceModule { }
