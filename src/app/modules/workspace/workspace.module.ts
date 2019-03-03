import { ColorHueModule } from 'ngx-color/hue'; // <color-hue-picker></color-hue-picker>
import { ShareSlackComponent } from "./components/sharing/slack.component";
import { SharedModule } from "../../shared/shared.module";
import { ConfirmationPopoverModule } from "angular-confirmation-popover";
import { MarkdownModule, } from "ngx-markdown";
import { FilterTagsComponent } from "./components/filtering/tags.component";
import { SearchComponent } from "./components/searching/search.component";
import { TreeModule } from "angular-tree-component";
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
import { PersonalSummaryComponent } from "./components/summary/overview/personal.component";
import { OnboardingComponent } from "../../shared/components/onboarding/onboarding.component";
import { InstructionsComponent } from "../../shared/components/instructions/instructions.component";
import { PersonalCardComponent } from "./components/summary/tab/card.component";
import { SlackService } from "./components/sharing/slack.service";
import { NgbTooltipModule, NgbTypeaheadModule, NgbPopoverModule, NgbTabsetModule } from "@ng-bootstrap/ng-bootstrap";
import { ColorPickerComponent } from "../../shared/components/color-picker/color-picker.component";
import { PermissionsModule } from "../../shared/permissions.module";
import { DataService } from "./services/data.service";
import { OnboardingModule } from "../../shared/onboarding.module";
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
import { InitiativeHelperInputComponent } from './components/data-entry/details/parts/helpers/helper-input.component';
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
        OnboardingModule,
       MarkdownModule.forChild(),
        ConfirmationPopoverModule.forRoot({
            confirmButtonType: "danger",
            cancelButtonType: "link"
        }),
        SharedModule,
        NgbTooltipModule,
        NgbTypeaheadModule,
        NgbPopoverModule,
        NgbTabsetModule,
        ColorHueModule,
        PermissionsModule
    ],
    declarations: [
        WorkspaceComponent,
        BuildingComponent, InitiativeNodeComponent, 
        InitiativeComponent, 
        InitiativeInputNameComponent,InitiativeListTagsComponent,
        InitiativeAuthoritySelectComponent,
        InitiativeDescriptionTextareaComponent,
        InitiativeHelpersSelectComponent,
        InitiativeHelperInputComponent,
        InitiativeHelperPrivilegeComponent,
        MappingComponent, MappingZoomableComponent, MappingTreeComponent, MappingNetworkComponent,
        MappingSummaryComponent, PersonalSummaryComponent, PersonalCardComponent,

        SearchComponent, FilterTagsComponent, ShareSlackComponent,
        TooltipComponent, ContextMenuComponent,
        ColorPickerComponent,
        EditTagsComponent,
        CommonAutocompleteComponent,
        CommonTextareaComponent
    ],
    providers: [BillingGuard,WorkspaceGuard,UIService,ColorService,
        SlackService, DataService,MapSettingsService,
        WorkspaceComponentResolver
    ],
    entryComponents: [OnboardingComponent, InstructionsComponent]
})
export class WorkspaceModule { }