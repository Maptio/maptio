import { ShareSlackComponent } from "./share/slack.component";
import { SharedModule } from "./../../shared/shared.module";
import { ConfirmationPopoverModule } from "angular-confirmation-popover";
import { MarkdownModule, MarkedOptions, MarkedRenderer } from "ngx-markdown";
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
import { CommonComponentsModule } from "../../shared/common-components.module";
import { OnboardingComponent } from "../../shared/components/onboarding/onboarding.component";
import { InstructionsComponent } from "../../shared/components/instructions/instructions.component";
import { PersonalCardComponent } from "./mapping/summary/personal/card.component";
import { SlackService } from "./share/slack.service";
import { MapSettingsService } from "../../shared/services/map/map-settings.service";
import { NgbTooltipModule, NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";


const routes: Routes = [{
    path: "map/:mapid/:mapslug",
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
        CommonComponentsModule,
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
        NgbTypeaheadModule
    ],
    declarations: [
        FocusIfDirective,

        WorkspaceComponent,
        BuildingComponent, InitiativeNodeComponent, InitiativeComponent,
        MappingComponent, MappingZoomableComponent, MappingTreeComponent, MappingNetworkComponent,
        MappingSummaryComponent, PersonalSummaryComponent, PersonalCardComponent,

        SearchComponent, FilterTagsComponent, ShareSlackComponent,
        TooltipComponent, ContextMenuComponent
    ],
    providers: [
        SlackService, MapSettingsService,
        WorkspaceComponentResolver, MappingSummaryBreadcrumbs,
        // {
        //     provide: MarkdownService,
        //     useFactory: markdownServiceFactory,
        //     deps: [HttpClient, DomSanitizer, HttpHandler]
        // }
    ],
    entryComponents: [OnboardingComponent, InstructionsComponent]
})
export class WorkspaceModule { }