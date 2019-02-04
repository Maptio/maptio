import "ngx-color"
import "angular-tree-component";

import "ngx-markdown";
import "marked";

import "screenfull"

import "d3-array"
import "d3-collection"
import "d3-drag"
import "d3-force"
import "d3-interpolate";
import "d3-scale";
import "d3-transition"
import "d3-zoom"
import "d3-color"
import "d3-selection";



import { ColorHueModule } from 'ngx-color/hue'; // <color-hue-picker></color-hue-picker>


import { ShareSlackComponent } from "./share/slack.component";
import { SharedModule } from "./../../shared/shared.module";
import { ConfirmationPopoverModule } from "angular-confirmation-popover";
import { MarkdownModule, MarkedOptions, MarkedRenderer, MarkdownService } from "ngx-markdown";
import { Angulartics2Module } from "angulartics2";
import { FilterTagsComponent } from "./filter/tags.component";
import { SearchComponent } from "./search/search.component";
import { FocusIfDirective } from "./../../shared/directives/focusif.directive";
import { TreeModule } from "angular-tree-component";
import { WorkspaceGuard } from "../../shared/services/guards/workspace.guard";
import { WorkspaceComponent } from "./workspace.component";
import { WorkspaceComponentResolver } from "./workspace.resolver";
import { MappingNetworkComponent } from "./mapping/network/mapping.network.component";
import { MappingTreeComponent } from "./mapping/tree/mapping.tree.component";
import { MappingZoomableComponent } from "./mapping/zoomable/mapping.zoomable.component";
import { MappingComponent } from "./mapping/mapping.component";
import { InitiativeComponent } from "./initiative/initiative.component";
import { InitiativeNodeComponent } from "./building/initiative.node.component";
import { BuildingComponent } from "./building/building.component";
import { AccessGuard } from "../../shared/services/guards/access.guard";
import { AuthGuard } from "../../shared/services/guards/auth.guard";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BillingGuard } from "../../shared/services/guards/billing.guard";
import { TooltipComponent } from "./mapping/tooltip/tooltip.component";
import { ContextMenuComponent } from "./mapping/context-menu/context-menu.component";
import { MappingSummaryComponent } from "./mapping/summary/summary.component";
import { PersonalSummaryComponent } from "./mapping/summary/personal/personal.component";
import { MappingSummaryBreadcrumbs } from "./mapping/summary/summary.breadcrumb";
import { OnboardingComponent } from "../../shared/components/onboarding/onboarding.component";
import { InstructionsComponent } from "../../shared/components/instructions/instructions.component";
import { PersonalCardComponent } from "./mapping/summary/personal/card.component";
import { SlackService } from "./share/slack.service";
import { NgbTooltipModule, NgbTypeaheadModule, NgbPopoverModule, NgbTabsetModule } from "@ng-bootstrap/ng-bootstrap";
import { ColorPickerComponent } from "../../shared/components/color-picker/color-picker.component";
import { PermissionsModule } from "../../shared/permissions.module";
import { DataService } from "../../shared/services/data.service";
import { OnboardingModule } from "../../shared/onboarding.module";
import { MapSettingsService } from "../../shared/services/map/map-settings.service";
import { EditTagsComponent } from "./building/edit-tags.component";
import { UIService } from "../../shared/services/ui/ui.service";


const routes: Routes = [{
    path: "",
    data: { breadcrumbs: "{{data.dataset.initiative.name}}" },
    component: WorkspaceComponent,
    canActivate: [AuthGuard, AccessGuard, BillingGuard],
    resolve: {
        data: WorkspaceComponentResolver
    },
    children: [
        { path: "", redirectTo: "circles", pathMatch: "full" },
        { path: "circles", component: MappingZoomableComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Circles" } },
        { path: "tree", component: MappingTreeComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Tree" } },
        { path: "network", component: MappingNetworkComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Network" } },
        {
            path: "summary", component: MappingSummaryComponent, canActivate: [WorkspaceGuard], data: {
                breadcrumbs: MappingSummaryBreadcrumbs
            }
        }

    ]
}]


export function markedOptionsFactory(): MarkedOptions {
    const renderer = new MarkedRenderer();

    renderer.link = (href: string, title: string, text: string) => {
        return `<a href=${href} class="markdown-link" target="_blank" title=${title}>${text}</a>`;
    }

    renderer.paragraph = (text: string) => {
        return `<p class="markdown">${text}</p>`;
    }

    return {
        renderer: renderer,
        breaks: true
    };
}

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        TreeModule,
        Angulartics2Module.forChild(),
        OnboardingModule,
        MarkdownModule.forRoot({
            markedOptions: {
                provide: MarkedOptions,
                useFactory: markedOptionsFactory,
            },
        }),
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
        FocusIfDirective,

        WorkspaceComponent,
        BuildingComponent, InitiativeNodeComponent, InitiativeComponent,
        MappingComponent, MappingZoomableComponent, MappingTreeComponent, MappingNetworkComponent,
        MappingSummaryComponent, PersonalSummaryComponent, PersonalCardComponent,

        SearchComponent, FilterTagsComponent, ShareSlackComponent,
        TooltipComponent, ContextMenuComponent,
        ColorPickerComponent,
        EditTagsComponent
    ],
    providers: [BillingGuard,WorkspaceGuard,UIService,
        SlackService, DataService,MapSettingsService,
        WorkspaceComponentResolver, MappingSummaryBreadcrumbs, MarkdownService, MarkedOptions,
    ],
    entryComponents: [OnboardingComponent, InstructionsComponent]
})
export class WorkspaceModule { }