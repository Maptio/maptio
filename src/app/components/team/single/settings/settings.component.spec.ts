import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { TeamSettingsComponent } from "./settings.component";
import { TeamFactory } from "../../../../shared/services/team.factory";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { Team } from "../../../../shared/model/team.data";
import { AuthHttp, AuthConfig } from "angular2-jwt/angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../../../test/specs/shared/authhttp.helper.shared";
import { Http, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { User } from "../../../../shared/model/user.data";

describe("settings.component.ts", () => {

    let component: TeamSettingsComponent;
    let target: ComponentFixture<TeamSettingsComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [TeamSettingsComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule]
        }).overrideComponent(TeamSettingsComponent, {
            set: {
                providers: [
                    TeamFactory,
                    {
                        provide: AuthHttp,
                        useFactory: authHttpServiceFactoryTesting,
                        deps: [Http, BaseRequestOptions]
                    },
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                            return new Http(mockBackend, options);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    MockBackend,
                    BaseRequestOptions
                    // Angulartics2Mixpanel, Angulartics2
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamSettingsComponent);

        component = target.componentInstance;
        component.team = new Team({
            name: "Team",
            team_id: "1",
            settings: { authority: "Authority", helper: "Helper" },
            members: [new User({ user_id: "1" }), new User({ user_id: "2" })]
        })
        target.detectChanges();
    });

    it("should bind ", () => {
        expect(component.teamName).toBe("Team");
        expect(component.teamAuthority).toBe("Authority");
        expect(component.teamHelper).toBe("Helper")
    });

    describe("save", () => {
        it("should do nothing if form is unvalid", async(() => {
            component.teamSettingsForm.setValue({
                name: "s",
                authority: "King",
                helper: "Kong"
            });
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            spyOn(mockTeamFactory, "upsert");

            component.saveTeamSettings();

            expect(mockTeamFactory.upsert).not.toHaveBeenCalled();
        }));


        it("should save team when form is valid and update view when it succeeds", async(() => {
            component.teamSettingsForm.setValue({
                name: "More than 2 letters",
                authority: "King",
                helper: "Kong"
            });
            component.teamSettingsForm.markAsDirty();
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let spy = spyOn(mockTeamFactory, "upsert").and.returnValue(Promise.resolve(true));

            component.saveTeamSettings();

            spy.calls.mostRecent().returnValue.then(() => {
                expect(component.isTeamSettingSaved).toBe(true)
            })
            expect(mockTeamFactory.upsert).toHaveBeenCalledWith(jasmine.objectContaining({
                name: "More than 2 letters",
                settings: { authority: "King", helper: "Kong" },
                team_id: "1",
                members: [new User({ user_id: "1" }), new User({ user_id: "2" })]
            }))

        }));

        it("should save team when form is valid and update view when it fails", async(() => {
            component.teamSettingsForm.setValue({
                name: "More than 2 letters",
                authority: "King",
                helper: "Kong"
            });
            component.teamSettingsForm.markAsDirty();
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let spy = spyOn(mockTeamFactory, "upsert").and.returnValue(Promise.reject(false));

            component.saveTeamSettings();

            spy.calls.mostRecent().returnValue.then(() => {
                expect(component.isTeamSettingSaved).toBe(false)
            })
                .catch(() => {
                    expect(component.isTeamSettingFailed).toBe(true)
                })
            expect(mockTeamFactory.upsert).toHaveBeenCalledWith(jasmine.objectContaining({
                name: "More than 2 letters",
                settings: { authority: "King", helper: "Kong" },
                team_id: "1",
                members: [new User({ user_id: "1" }), new User({ user_id: "2" })]
            }))

        }));
    });

});
