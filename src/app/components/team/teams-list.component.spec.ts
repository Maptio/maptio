import { Http, BaseRequestOptions } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { TeamFactory } from "./../../shared/services/team.factory";
import { UserFactory } from "./../../shared/services/user.factory";
import { TeamsListComponent } from "./teams-list.component";
import { ErrorService } from "./../../shared/services/error/error.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Subject } from "rxjs/Rx";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { User } from "../../shared/model/user.data";
import { Auth } from "../../shared/services/auth/auth.service";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { MockBackend } from "@angular/http/testing";
import { Team } from "../../shared/model/team.data";

describe("teams-list.component.ts", () => {

    let component: TeamsListComponent;
    let target: ComponentFixture<TeamsListComponent>;
    let user$: Subject<User> = new Subject<User>();

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [TeamsListComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(TeamsListComponent, {
            set: {
                providers: [
                    {
                        provide: Auth, useClass: class {
                            getUser() { return user$.asObservable() }
                            getUserInfo(id: string) { return Promise.resolve(new User({})); }
                        }
                    },
                    UserFactory, TeamFactory,
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
                    ErrorService
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
        user$.next(new User({ user_id: "some_new_id", teams: [] }));
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
            let mockAuth = target.debugElement.injector.get(Auth);

            let spyGetTeam = spyOn(mockTeamFactory, "get").and.callFake((id: string) => {
                return Promise.resolve(new Team({
                    team_id: id,
                    name: `Team ${id}`,
                    members: [new User({ user_id: `${id}1` }), new User({ user_id: `${id}2` }), new User({ user_id: `${id}3` })]
                }))
            })

            let spyGetUserInfo = spyOn(mockAuth, "getUserInfo").and.callFake((user_id: string) => {
                return Promise.resolve(new User({ user_id: user_id }))
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
                expect(spyGetUserInfo).toHaveBeenCalledTimes(9)
            })
            expect(spyGetTeam).toHaveBeenCalledTimes(3);
        }))

        it("should gather team and members data when team retrieval fails", async(() => {
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockAuth = target.debugElement.injector.get(Auth);

            let spyGetTeam = spyOn(mockTeamFactory, "get").and.callFake((id: string) => {
                return (Number.parseInt(id) % 2)
                    ? Promise.resolve(new Team({
                        team_id: id,
                        name: `Team ${id}`,
                        members: [new User({ user_id: `${id}1` }), new User({ user_id: `${id}2` }), new User({ user_id: `${id}3` })]
                    }))
                    : Promise.reject("Can't find team")
            })

            let spyGetUserInfo = spyOn(mockAuth, "getUserInfo").and.callFake((user_id: string) => {
                return Promise.resolve(new User({ user_id: user_id }))
            })

            user$.next(new User({ user_id: "some_new_id_again", teams: ["1", "2", "3"] }));

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

                expect(spyGetUserInfo).toHaveBeenCalledTimes(6)
            })
            expect(spyGetTeam).toHaveBeenCalledTimes(3);
        }))

        it("should gather team and members data when member retrieval fails", async(() => {
            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockAuth = target.debugElement.injector.get(Auth);

            let spyGetTeam = spyOn(mockTeamFactory, "get").and.callFake((id: string) => {
                return Promise.resolve(new Team({
                    team_id: id,
                    name: `Team ${id}`,
                    members: [new User({ user_id: `${id}1` }), new User({ user_id: `${id}2` }), new User({ user_id: `${id}3` })]
                }))
            })

            let spyGetUserInfo = spyOn(mockAuth, "getUserInfo").and.callFake((user_id: string) => {
                // fails only the first member of each triplet
                if (user_id.endsWith("1")) {
                    return Promise.reject("Cant find member")
                }
                else {
                    return Promise.resolve(new User({ user_id: user_id }))
                }
            })

            user$.next(new User({ user_id: "some_new_id", teams: ["1", "2", "3"] }));

            component.teams$.then(ts => {

                expect(ts.length).toBe(3);

                ts.forEach((t, index) => {
                    expect(t.team_id).toBe(`${index + 1}`);
                    expect(t.name).toBe(`Team ${index + 1}`);
                    expect(t.members.length).toBe(3);
                    expect(t.members.every(m => !m.isDeleted)).toBeFalsy();
                    expect(t.members.filter(m => m.isDeleted).length).toBe(1);
                })
                expect(spyGetUserInfo).toHaveBeenCalledTimes(9)
            })
            expect(spyGetTeam).toHaveBeenCalledTimes(3);
        }))
    });

    describe("createNewTeam", () => {
        it("should create a new team and add current user to it", async(() => {

            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);

            let spyCreate = spyOn(mockTeamFactory, "create").and.returnValue(Promise.resolve(new Team({ team_id: "3" })))
            let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(true))

            user$.next(new User({ user_id: "123", teams: ["1", "2"] }));
            component.createNewTeam("New");

            expect(spyCreate).toHaveBeenCalledWith(jasmine.objectContaining({ name: "New", members: [jasmine.objectContaining({ user_id: "123" })] }))

            spyCreate.calls.mostRecent().returnValue.then((team: Team) => {
                expect(team.team_id).toBe("3");
                expect(component.user.teams.length).toBe(3);
                expect(spyUpsert).toHaveBeenCalledWith(component.user)
            })

        }));

        it("should display error message if creation fails", async(() => {

            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);

            let spyCreate = spyOn(mockTeamFactory, "create").and.returnValue(Promise.reject("Cant create this team"))
            let spyUpsert = spyOn(mockUserFactory, "upsert")

            user$.next(new User({ user_id: "123", teams: ["1", "2"] }));
            component.createNewTeam("New");

            expect(spyCreate).toHaveBeenCalledWith(jasmine.objectContaining({ name: "New", members: [jasmine.objectContaining({ user_id: "123" })] }))

            spyCreate.calls.mostRecent().returnValue
                .then((team: Team) => {
                    expect(spyUpsert).not.toHaveBeenCalled();
                })
                .catch(() => {
                    expect(component.errorMessage).toBe("Unable to create team New!")
                })

        }));

        it("should display error message if user update fails", async(() => {

            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);

            let spyCreate = spyOn(mockTeamFactory, "create").and.returnValue(Promise.resolve(new Team({ team_id: "3" })))
            let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(false))

            user$.next(new User({ user_id: "123", teams: ["1", "2"] }));
            component.createNewTeam("New");

            expect(spyCreate).toHaveBeenCalledWith(jasmine.objectContaining({ name: "New", members: [jasmine.objectContaining({ user_id: "123" })] }))

            spyCreate.calls.mostRecent().returnValue
                .then((team: Team) => {
                    expect(team.team_id).toBe("3");
                    expect(component.user.teams.length).toBe(3);
                    expect(spyUpsert).toHaveBeenCalledWith(component.user)
                    spyUpsert.calls.mostRecent().returnValue.then(() => { }).catch((reason: any) => {
                        expect(reason).toBe("Unable to add you to team New!")
                    })
                })
                .catch(() => {
                    expect(component.errorMessage).toBe("Unable to add you to team New!")
                })

        }));
    });



});
