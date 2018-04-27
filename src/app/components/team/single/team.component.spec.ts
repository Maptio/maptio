import { SharedModule } from './../../../shared/shared.module';
import { Permissions } from "./../../../shared/model/permission.data";
import { Auth } from "./../../../shared/services/auth/auth.service";
import { KeysPipe } from "./../../../pipes/keys.pipe";
import { TeamModule } from "./../team.module";
import { User } from "./../../../shared/model/user.data";
import { Team } from "./../../../shared/model/team.data";
import { Observable } from "rxjs/Rx";
import { ActivatedRoute, ActivatedRouteSnapshot } from "@angular/router";
import { TeamComponent } from "./team.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";


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
