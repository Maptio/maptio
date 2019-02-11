import { SharedModule } from "./../../../../shared/shared.module";
import { Permissions } from "./../../../../shared/model/permission.data";
import { Auth } from "../../../../core/authentication/auth.service";
import { ActivatedRouteSnapshot, ActivatedRoute, UrlSegment, ParamMap, Params, Data, Route } from "@angular/router";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { TeamSettingsComponent } from "./settings.component";
import { TeamFactory } from "../../../../core/http/team/team.factory";
import { NO_ERRORS_SCHEMA, Type } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { Team } from "../../../../shared/model/team.data";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../../core/mocks/authhttp.helper.shared";
import { Http, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { User } from "../../../../shared/model/user.data";
import { Observable } from "rxjs/Observable";
import { AnalyticsModule } from "../../../../core/analytics.module";
import { CoreModule } from "../../../../core/core.module";
import { PermissionsModule } from "../../../../shared/permissions.module";

class MockActivatedRoute implements ActivatedRoute {
    paramMap: Observable<ParamMap>;
    queryParamMap: Observable<ParamMap>;
    snapshot: ActivatedRouteSnapshot;
    url: Observable<UrlSegment[]>;
    params: Observable<Params>;
    queryParams: Observable<Params>;
    fragment: Observable<string>;
    data: Observable<Data> = Observable.of({
        assets: {
            team: new Team({
                team_id: "123",
                name: "team",
                settings: { authority: "A", helper: "H" },
                members: [new User({ user_id: "1" }), new User({ user_id: "2" })]
            })
        }
    })
    outlet: string;
    component: Type<any> | string;
    routeConfig: Route;
    root: ActivatedRoute;
    parent: ActivatedRoute;
    firstChild: ActivatedRoute;
    children: ActivatedRoute[];
    pathFromRoot: ActivatedRoute[];
    toString(): string {
        return "";
    };
}

describe("settings.component.ts", () => {

    let component: TeamSettingsComponent;
    let target: ComponentFixture<TeamSettingsComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [TeamSettingsComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, SharedModule,  AnalyticsModule, CoreModule, PermissionsModule]
        }).overrideComponent(TeamSettingsComponent, {
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
                    BaseRequestOptions,
                    {
                        provide: ActivatedRoute,
                        useClass: class {
                            params = Observable.of({ teamid: 123, slug: "slug" })
                            parent = new MockActivatedRoute()
                        }
                    }
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamSettingsComponent);

        component = target.componentInstance;
        target.detectChanges();
    });

    it("should bind ", () => {
        expect(component.teamName).toBe("team");
        expect(component.teamAuthority).toBe("A");
        expect(component.teamHelper).toBe("H")
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

        xit("should save team when form is valid and update view when it succeeds", async(() => {
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
                team_id: "123",
                members: [new User({ user_id: "1" }), new User({ user_id: "2" })]
            }))

        }));

        xit("should save team when form is valid and update view when it fails", async(() => {
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
                team_id: "123",
                members: [new User({ user_id: "1" }), new User({ user_id: "2" })]
            }))

        }));
    });

});
