
import { PopoverStickyComponent } from './../utils/popover/sticky.component';
import { SharedModule } from './../../shared/shared.module';
import { ConfirmationPopoverModule } from "angular-confirmation-popover";
import { ColorPickerModule } from "ngx-color-picker";
import { MarkdownService } from "angular2-markdown";
import { Http } from "@angular/http";
import { MarkdownModule } from "angular2-markdown";
import { Angulartics2Module } from "angulartics2";
import { FilterTagsComponent } from "./filter/tags.component";
import { SearchComponent } from "./search/search.component";
import { FocusIfDirective } from "./../../shared/directives/focusif.directive";
import { TreeModule } from "angular-tree-component";
import { MemberSummaryComponent } from "./mapping/member-summary/member-summary.component";
import { WorkspaceGuard } from "./../../shared/services/guards/workspace.guard";
import { WorkspaceComponent } from "./workspace.component";
import { WorkspaceComponentResolver } from "./workspace.resolver";
import { MappingNetworkComponent } from "./mapping/network/mapping.network.component";
import { MappingTreeComponent } from "./mapping/tree/mapping.tree.component";
import { MappingZoomableComponent } from "./mapping/zoomable/mapping.zoomable.component";
import { MappingComponent } from "./mapping/mapping.component";
import { InitiativeComponent } from "./initiative/initiative.component";
import { InitiativeNodeComponent } from "./building/initiative.node.component";
import { BuildingComponent } from "./building/building.component";

import { AccessGuard } from "./../../shared/services/guards/access.guard";
import { AuthGuard } from "./../../shared/services/guards/auth.guard";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterModule, Routes } from "@angular/router";
import { LoadingModule, ANIMATION_TYPES } from "ngx-loading";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


const routes: Routes = [{
    path: "map/:mapid/:mapslug",
    data: { breadcrumbs: "{{data.dataset.initiative.name}}" },
    component: WorkspaceComponent,
    canActivate: [AuthGuard, AccessGuard],
    resolve: {
        data: WorkspaceComponentResolver
    },
    children: [
        { path: "", redirectTo: "circles", pathMatch: "full" },
        { path: "circles", component: MappingZoomableComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Circles" } },
        { path: "tree", component: MappingTreeComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Tree" } },
        { path: "network", component: MappingNetworkComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Network" } },
        { path: "u/:usershortid/:userslug", component: MemberSummaryComponent, canActivate: [WorkspaceGuard], data: { breadcrumbs: true, text: "Summary" } }
    ]
}]

export function markdownServiceFactory(http: Http) {
    let _markdown = new MarkdownService(http)
    _markdown.setMarkedOptions({ breaks: true })
    _markdown.renderer.link = (href: string, title: string, text: string) => {
        return `<a href=${href} class="markdown-link" target="_blank" title=${title}>${text}</a>`;
    }

    _markdown.renderer.paragraph = (text: string) => {
        return `<p class="markdown">${text}</p>`;
    }
    return _markdown
}

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        NgbModule.forRoot(),
        TreeModule,
        ColorPickerModule,
        Angulartics2Module.forChild(),
        MarkdownModule,
        LoadingModule.forRoot({
            animationType: ANIMATION_TYPES.chasingDots,
            backdropBackgroundColour: "#fff",
            backdropBorderRadius: ".25rem",
            primaryColour: "#EF5E26",
            secondaryColour: "#2F81B7",
            tertiaryColour: "#ffffff"
        }),
        ConfirmationPopoverModule.forRoot({
            confirmButtonType: "danger",
            cancelButtonType: "secondary"
        }),
        SharedModule
    ],
    declarations: [
        FocusIfDirective,

        WorkspaceComponent,
        BuildingComponent, InitiativeNodeComponent, InitiativeComponent,
        MappingComponent, MappingZoomableComponent, MappingTreeComponent, MappingNetworkComponent, MemberSummaryComponent,

        SearchComponent, FilterTagsComponent,

        PopoverStickyComponent
    ],
    providers: [
        WorkspaceComponentResolver,
        {
            provide: MarkdownService,
            useFactory: markdownServiceFactory,
            deps: [Http]
        }]
})
export class WorkspaceModule { }