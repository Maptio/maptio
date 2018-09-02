import { TeamIntegrationsComponent } from "./single/integrations/integrations.component";
import { Permissions } from "../../shared/model/permission.data";
import { PermissionGuard } from "../../shared/services/guards/permission.guard";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationPopoverModule } from "angular-confirmation-popover";
import { ANIMATION_TYPES, LoadingModule } from "ngx-loading";
import { KeysPipe } from "../../pipes/keys.pipe";
import { AccessGuard } from "../../shared/services/guards/access.guard";
import { AuthGuard } from "../../shared/services/guards/auth.guard";
import { SharedModule } from "../../shared/shared.module";
import { TeamListComponent } from "./list/team-list.component";
import { TeamListComponentResolver } from "./list/team-list.resolver";
import { TeamImportComponent } from "./single/import/import.component";
import { TeamMapsComponent } from "./single/maps/maps.component";
import { TeamMembersComponent } from "./single/members/members.component";
import { TeamSettingsComponent } from "./single/settings/settings.component";
import { TeamComponent } from "./single/team.component";
import { TeamComponentResolver } from "./single/team.resolver";
import { IntercomService } from "./list/intercom.service";
import { TeamBillingComponent } from "./single/billing/billing.component";

const routes: Routes = [
    {
        path: "teams",
        data: { breadcrumbs: "Teams" },
        children: [
            {
                path: "", component: TeamListComponent, canActivate: [AuthGuard],
                resolve: {
                    teams: TeamListComponentResolver
                }
            },
            {
                path: ":teamid/:slug",
                resolve: {
                    assets: TeamComponentResolver
                },
                component: TeamComponent,
                data: { breadcrumbs: "{{assets.team.name}}" },
                canActivate: [AuthGuard, AccessGuard],
                children: [
                    { path: "", redirectTo: "members", pathMatch: "full" },
                    { path: "members", component: TeamMembersComponent, data: { breadcrumbs: true, text: "Members" } },
                    {
                        path: "import",
                        component: TeamImportComponent,
                        canActivate: [PermissionGuard],
                        data: {
                            permissions: [Permissions.canInviteUser], breadcrumbs: true, text: "Import"
                        }
                    },
                    { path: "maps", component: TeamMapsComponent, data: { breadcrumbs: true, text: "Maps" } },
                    { path: "settings", component: TeamSettingsComponent, data: { breadcrumbs: true, text: "Settings" } },
                    { path: "integrations", component: TeamIntegrationsComponent, data: { breadcrumbs: true, text: "Integrations" } },
                    { path: "billing", component: TeamBillingComponent, data: { breadcrumbs: true, text: "Billing" } }
                ]
            }
        ]

    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        NgbModule.forRoot(),
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
        TeamComponent,
        TeamListComponent,
        TeamMembersComponent,
        TeamSettingsComponent,
        TeamImportComponent,
        TeamIntegrationsComponent,
        TeamBillingComponent,
        TeamMapsComponent,
        KeysPipe
    ],
    providers: [TeamComponentResolver, TeamListComponentResolver, IntercomService]
})
export class TeamModule { }