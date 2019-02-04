import { TeamComponent } from "./team.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { SharedModule } from "../../../../shared/shared.module";
import { Auth } from "../../../../shared/services/auth/auth.service";
import { Permissions } from "../../../../shared/model/permission.data";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { Team } from "../../../../shared/model/team.data";
import { User } from "../../../../shared/model/user.data";


describe("team.component.ts", () => {

    let component: TeamComponent;
    let target: ComponentFixture<TeamComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [TeamComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, SharedModule]
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
                            params = Observable.of({ teamid: 123, slug: "slug" })
                            snapshot: ActivatedRouteSnapshot = new ActivatedRouteSnapshot()
                            data = Observable.of({
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
