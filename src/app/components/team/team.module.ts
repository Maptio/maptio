import { TeamComponentResolver } from "./single/team.resolver";
import { AccessGuard } from "./../../shared/services/guards/access.guard";
import { AuthGuard } from "./../../shared/services/guards/auth.guard";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterModule, Routes } from "@angular/router";
import { LoadingModule, ANIMATION_TYPES } from "ngx-loading";
import { TeamImportComponent } from "./single/import/import.component";
import { TeamSettingsComponent } from "./single/settings/settings.component";
import { TeamMembersComponent } from "./single/members/members.component";
import { TeamListComponent } from "./list/team-list.component";
import { TeamComponent } from "./single/team.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

const routes: Routes = [
    {
        path: "teams",
        data: { breadcrumbs: "Teams" },
        children: [
            { path: "", component: TeamListComponent, canActivate: [AuthGuard] },
            {
                path: ":teamid/:slug",
                resolve: {
                    team: TeamComponentResolver
                },
                component: TeamComponent,
                data: { breadcrumbs: "{{team.name}}" },
                canActivate: [AuthGuard, AccessGuard],
                children: [
                    { path: "", redirectTo: "members", pathMatch: "full" },
                    { path: "members", component: TeamMembersComponent, data: { breadcrumbs: true, text: "Members" } },
                    { path: "import", component: TeamImportComponent, data: { breadcrumbs: true, text: "Import" } },
                    { path: "settings", component: TeamSettingsComponent, data: { breadcrumbs: true, text: "Settings" } }
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
        })
    ],
    declarations: [
        TeamComponent,
        TeamListComponent,
        TeamMembersComponent,
        TeamSettingsComponent,
        TeamImportComponent

    ],
    providers: [TeamComponentResolver]
})
export class TeamModule { }