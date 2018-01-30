import { JwtEncoder } from "./../../shared/services/encoding/jwt.service";
import { MailingService } from "./../../shared/services/mailing/mailing.service";
import { UserService } from "./../../shared/services/user/user.service";
import { Angulartics2Mixpanel, Angulartics2, Angulartics2Module } from "angulartics2";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { TeamFactory } from "./../../shared/services/team.factory";
import { UserFactory } from "./../../shared/services/user.factory";
import { TeamsListComponent } from "./teams-list.component";
import { ErrorService } from "./../../shared/services/error/error.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Subject, Observable } from "rxjs/Rx";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { User } from "../../shared/model/user.data";
import { Auth } from "../../shared/services/auth/auth.service";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { MockBackend } from "@angular/http/testing";
import { Team } from "../../shared/model/team.data";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthConfiguration } from "../../shared/services/auth/auth.config";
import { Router, NavigationStart } from "@angular/router";

describe("teams-list.component.ts", () => {

    let component: TeamsListComponent;
    let target: ComponentFixture<TeamsListComponent>;
    let user$: Subject<User> = new Subject<User>();

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [TeamsListComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, Angulartics2Module]
        }).overrideComponent(TeamsListComponent, {
            set: {
                providers: [
                    {
                        provide: Auth, useClass: class {
                            getUser() { return user$.asObservable() }
                            getUserInfo(id: string) { return Promise.resolve(new User({})); }
                        }
                    },
                    UserFactory, TeamFactory, AuthConfiguration, UserService, MailingService, JwtEncoder,
                    {
                        provide: AuthHttp,
                        useFactory: authHttpServiceFactoryTesting,
                        deps: [Http, BaseRequestOptions]
                    },
                    {
                        provide: Router, useClass: class {
                            // navigate = jasmine.createSpy("navigate");
                            events = Observable.of(new NavigationStart(0, "/next"))
                        }
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
                    ErrorService,
                    Angulartics2Mixpanel, Angulartics2
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamsListComponent);

        component = target.componentInstance;

        target.detectChanges();
    });

    // afterEach(() => {
    //     user$.next(new User({ user_id: "reset", teams: [] }));
    // })

    it("should gather user data", () => {
        user$.next(new User({ user_id: "some_new_id", teams: ["1", "2", "3"] }));
        expect(component.user.user_id).toBe("some_new_id");
    });

    it("should get rid of subscription on destroy", () => {
        let spyUser = spyOn(component.userSubscription, "unsubscribe")
        let spyRoute = spyOn(component.userSubscription2, "unsubscribe")
        target.destroy();
        expect(spyUser).toHaveBeenCalled();
        expect(spyRoute).toHaveBeenCalled();
    })

    describe("trackByMemberId", () => {
        it("should return user_id", () => {
            let user = new User({ user_id: "123" });
            expect(component.trackByMemberId(undefined, user)).toBe("123");
        });
    });

    describe("trackByTeamId", () => {
        it("should return team_id", () => {
            let user = new Team({ team_id: "123" });
            expect(component.trackByTeamId(undefined, user)).toBe("123");
        });
    });

    describe("getTeams", () => {
        it("should gather team and members data", async(() => {
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockUserService = target.debugElement.injector.get(UserService);
            let spyGetTeam = spyOn(mockTeamFactory, "get").and.callFake((ids: string[]) => {
                return Promise.resolve(
                    [
                        new Team({ team_id: "3", name: `Team 3`, members: [new User({ user_id: `31` }), new User({ user_id: `32` }), new User({ user_id: `33` })] }),
                        new Team({ team_id: "1", name: `Team 1`, members: [new User({ user_id: `21` }), new User({ user_id: `12` }), new User({ user_id: `13` })] }),
                        new Team({ team_id: "2", name: `Team 2`, members: [new User({ user_id: `11` }), new User({ user_id: `22` }), new User({ user_id: `23` })] })
                    ]
                )
            })

            let spyGetUserInfo = spyOn(mockUserService, "getUsersInfo").and.callFake((users: User[]) => {
                return Promise.resolve(users)
            })

            user$.next(new User({ user_id: "some_new_id", teams: ["1", "2", "3"] }));

            component.teams$.then(ts => {
                expect(ts.length).toBe(3);
                ts.forEach((t, index) => {
                    expect(t.team_id).toBe(`${index + 1}`);
                    expect(t.name).toBe(`Team ${index + 1}`);
                    expect(t.members.length).toBe(3);
                    expect(t.members.every(m => !m.isDeleted)).toBeTruthy();
                })
                expect(spyGetUserInfo).toHaveBeenCalledTimes(3)
            })
            expect(spyGetTeam).toHaveBeenCalledTimes(1);
        }))

        it("should gather team and members data when team retrieval fails", async(() => {
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockUserService = target.debugElement.injector.get(UserService);
            let spyGetTeam = spyOn(mockTeamFactory, "get").and.callFake((ids: string[]) => {
                return Promise.resolve(
                    [
                        new Team({ team_id: "3", name: `Team 3`, members: [new User({ user_id: `31` }), new User({ user_id: `32` }), new User({ user_id: `33` })] }),
                        new Team({ team_id: "1", name: `Team 1`, members: [new User({ user_id: `21` }), new User({ user_id: `12` }), new User({ user_id: `13` })] }),
                    ]
                )
            })

            let spyGetUserInfo = spyOn(mockUserService, "getUsersInfo").and.callFake((users: User[]) => {
                return Promise.resolve(users)
            })


            user$.next(new User({ user_id: "some_new_id_again", teams: ["3", "2", "1"] }));

            component.teams$.then(ts => {

                expect(ts.length).toBe(2);

                expect(ts[0].team_id).toBe("1");
                expect(ts[0].name).toBe(`Team 1`);
                expect(ts[0].members.length).toBe(3);
                expect(ts[0].members.every(m => !m.isDeleted)).toBeTruthy();
                expect(ts[1].team_id).toBe("3");
                expect(ts[1].name).toBe(`Team 3`);
                expect(ts[1].members.length).toBe(3);
                expect(ts[1].members.every(m => !m.isDeleted)).toBeTruthy();

                expect(spyGetUserInfo).toHaveBeenCalledTimes(2)
            })
            expect(spyGetTeam).toHaveBeenCalledTimes(1);
        }))

        it("should gather team and members data when member retrieval fails", async(() => {
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockUserService = target.debugElement.injector.get(UserService);

            let spyGetTeam = spyOn(mockTeamFactory, "get").and.callFake((ids: string[]) => {
                return Promise.resolve(
                    [
                        new Team({ team_id: "3", name: `Team 3`, members: [new User({ user_id: `31` }), new User({ user_id: `32` }), new User({ user_id: `33` })] }),
                        new Team({ team_id: "1", name: `Team 1`, members: [new User({ user_id: `21` }), new User({ user_id: `12` }), new User({ user_id: `13` })] }),
                        new Team({ team_id: "2", name: `Team 2`, members: [new User({ user_id: `11` }), new User({ user_id: `22` }), new User({ user_id: `23` })] })
                    ]
                )
            })

            let spyGetUserInfo = spyOn(mockUserService, "getUsersInfo").and.callFake((users: User[]) => {
                return Promise.resolve(users.slice(1))
            })

            user$.next(new User({ user_id: "some_new_id", teams: ["3", "1", "2"] }));

            component.teams$.then(ts => {

                expect(ts.length).toBe(3);

                ts.forEach((t, index) => {
                    expect(t.team_id).toBe(`${index + 1}`);
                    expect(t.name).toBe(`Team ${index + 1}`);
                    expect(t.members.length).toBe(3);
                    expect(t.members.every(m => !m.isDeleted)).toBeFalsy();
                    expect(t.members.filter(m => m.isDeleted).length).toBe(1);
                })
                expect(spyGetUserInfo).toHaveBeenCalledTimes(3)
            })
            expect(spyGetTeam).toHaveBeenCalledTimes(1);
        }))
    });

    describe("createNewTeam", () => {
        it("should do nothing if the form is not valid", async(() => {

            component.createForm.setValue({
                teamName: ""
            })

            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);

            let spyCreate = spyOn(mockTeamFactory, "create")
            component.createNewTeam();

            expect(spyCreate).not.toHaveBeenCalled();

        }));


        it("should create a new team and add current user to it", async(() => {

            component.createForm.setValue({
                teamName: "New"
            })
            component.createForm.markAsDirty();

            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let mockRouter = target.debugElement.injector.get(Router)

            let spyCreate = spyOn(mockTeamFactory, "create").and.returnValue(Promise.resolve(new Team({ team_id: "3", name: "new team" })))
            let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(true));

            component.user = new User({ user_id: "123", teams: ["1", "2"] });
            component.createNewTeam();

            expect(spyCreate).toHaveBeenCalledWith(jasmine.objectContaining({ name: "New", members: [jasmine.objectContaining({ user_id: "123" })] }))

            spyCreate.calls.mostRecent().returnValue.then((team: Team) => {
                expect(team.team_id).toBe("3");
                expect(component.user.teams.length).toBe(3);
                expect(spyUpsert).toHaveBeenCalledWith(component.user);
            })

        }));

        it("should display error message if creation fails", async(() => {

            component.createForm.setValue({
                teamName: "New"
            })
            component.createForm.markAsDirty();

            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let mockRouter = target.debugElement.injector.get(Router)

            let spyCreate = spyOn(mockTeamFactory, "create").and.returnValue(Promise.reject("Cant create this team"))
            let spyUpsert = spyOn(mockUserFactory, "upsert")

            component.user = new User({ user_id: "123", teams: ["1", "2"] });
            component.createNewTeam();

            expect(spyCreate).toHaveBeenCalledWith(jasmine.objectContaining({ name: "New", members: [jasmine.objectContaining({ user_id: "123" })] }))

            spyCreate.calls.mostRecent().returnValue
                .then((team: Team) => {
                    expect(spyUpsert).not.toHaveBeenCalled();
                })
                .then(() => {
                    // expect(mockRouter.navigate).not.toHaveBeenCalled();
                })
                .catch(() => {
                    expect(component.errorMessage).toBe("Unable to create team New!")
                })

        }));

        it("should display error message if user update fails", async(() => {

            component.createForm.setValue({
                teamName: "New"
            })
            component.createForm.markAsDirty();

            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let mockRouter = target.debugElement.injector.get(Router);

            let spyCreate = spyOn(mockTeamFactory, "create").and.returnValue(Promise.resolve(new Team({ team_id: "3" })))
            let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(false))

            component.user = new User({ user_id: "123", teams: ["1", "2"] });
            component.createNewTeam();

            expect(spyCreate).toHaveBeenCalledWith(jasmine.objectContaining({ name: "New", members: [jasmine.objectContaining({ user_id: "123" })] }))

            spyCreate.calls.mostRecent().returnValue
                .then((team: Team) => {
                    expect(team.team_id).toBe("3");
                    expect(component.user.teams.length).toBe(3);
                    expect(spyUpsert).toHaveBeenCalledWith(component.user)
                    spyUpsert.calls.mostRecent().returnValue.then(() => { })
                        .then(() => { })
                        .catch((reason: any) => {
                            expect(reason).toBe("Unable to add you to team New!")
                        })
                })
                .then(() => {
                    // expect(mockRouter.navigate).not.toHaveBeenCalled();
                })
                .catch((reason: any) => {
                    expect(component.errorMessage).toBe("Unable to add you to team New!")
                })

        }));
    });



});
