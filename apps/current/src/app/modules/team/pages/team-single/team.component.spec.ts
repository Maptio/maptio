
import {of as observableOf,  Observable } from 'rxjs';
import { TeamComponent } from "./team.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { SharedModule } from "../../../../shared/shared.module";
import { Auth } from "../../../../core/authentication/auth.service";
import { Permissions } from "../../../../shared/model/permission.data";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { Team } from "../../../../shared/model/team.data";
import { User } from "../../../../shared/model/user.data";
import { AnalyticsModule } from "../../../../core/analytics.module";
import { CoreModule } from "../../../../core/core.module";
import { PermissionsModule } from "../../../../shared/permissions.module";


describe("team.component.ts", () => {

    let component: TeamComponent;
    let target: ComponentFixture<TeamComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [TeamComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, SharedModule.forRoot(), AnalyticsModule, CoreModule, PermissionsModule]
        }).overrideComponent(TeamComponent, {
            set: {
                providers: [
                    {
                        provide: Auth,
                        useClass: class {
                            getPermissions(): Permissions[] {
                                return []
                            }
                        }
                    },
                    {
                        provide: ActivatedRoute,
                        useClass: class {
                            params = observableOf({ teamid: 123, slug: "slug" })
                            snapshot: ActivatedRouteSnapshot = new ActivatedRouteSnapshot()
                            data = observableOf({
                                assets: {
                                    team: new Team({
                                        team_id: "team123",
                                        name: "team",
                                        settings: { authority: "A", helper: "H" },
                                        members: [new User({ user_id: "1" })]
                                    })
                                }
                            })
                        }
                    }
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamComponent);

        component = target.componentInstance;
        target.detectChanges();
    });

    it("should behave...", () => {
        expect(true).toBe(true)
    });


});
