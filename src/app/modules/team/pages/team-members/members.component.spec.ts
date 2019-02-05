import { SharedModule } from './../../../../shared/shared.module';
import { NO_ERRORS_SCHEMA, Type } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { BaseRequestOptions, Http } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { ActivatedRoute, ActivatedRouteSnapshot, Data, ParamMap, Params, Route, UrlSegment } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthHttp } from "angular2-jwt";
import { Angulartics2, Angulartics2Mixpanel, Angulartics2Module } from "angulartics2";
import { Observable } from "rxjs/Rx";
import { authHttpServiceFactoryTesting } from "../../../../../test/specs/shared/authhttp.helper.shared";
import { KeysPipe } from "../../../../shared/pipes/keys.pipe";
import { Permissions } from "./../../../../shared/model/permission.data";
import { Team } from "./../../../../shared/model/team.data";
import { User } from "./../../../../shared/model/user.data";
import { AuthConfiguration } from "../../../../core/authentication/auth.config";
import { Auth } from "../../../../core/authentication/auth.service";
import { DatasetFactory } from "../../../../core/http/map/dataset.factory";
import { JwtEncoder } from "./../../../../shared/services/encoding/jwt.service";
import { ErrorService } from "./../../../../shared/services/error/error.service";
import { FileService } from "./../../../../shared/services/file/file.service";
import { MailingService } from "./../../../../shared/services/mailing/mailing.service";
import { TeamFactory } from "../../../../core/http/team/team.factory";
import { UserFactory } from "../../../../core/http/user/user.factory";
import { UserService } from "./../../../../shared/services/user/user.service";
import { TeamMembersComponent } from "./members.component";
import { NgProgressModule, NgProgress } from '@ngx-progressbar/core';
import { LoaderService } from '../../../../shared/components/loading/loader.service';
import { IntercomModule } from 'ng-intercom';

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


describe("members.component.ts", () => {
    let component: TeamMembersComponent;
    let target: ComponentFixture<TeamMembersComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TeamMembersComponent, KeysPipe],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, SharedModule, Angulartics2Module,  NgProgressModule,  IntercomModule.forRoot({
                appId: "",
                updateOnRouterChange: true
            })]
        }).overrideComponent(TeamMembersComponent, {
            set: {
                providers: [
                    TeamFactory, UserFactory, DatasetFactory, AuthConfiguration, FileService,
                    {
                        provide: LoaderService,
                        useClass: class {
                            hide = jasmine.createSpy("hide")
                            show = jasmine.createSpy("show")
                        },
                        deps: [NgProgress]
                    }, NgProgress,
                    JwtEncoder, MailingService,
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
                    {
                        provide: Auth,
                        useClass: class {
                            getUser() { return Observable.of(new User({ user_id: "USER_ID" })) }
                            getPermissions(): Permissions[] {
                                return []
                            }
                        }
                    },
                    MockBackend,
                    BaseRequestOptions,
                    ErrorService, UserService,
                    {
                        provide: ActivatedRoute,
                        useClass: class {
                            params = Observable.of({ teamid: 123, slug: "slug" })
                            parent = new MockActivatedRoute()
                        }
                    },
                    Angulartics2Mixpanel, Angulartics2
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamMembersComponent);
        component = target.componentInstance;
        target.detectChanges();
    });

    describe("getAllMembers", () => {
        it("should retrieve members information ", async(() => {
            component.team = new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] });

            spyOn(target.debugElement.injector.get(UserService), "getUsersInfo").and.returnValue((users: User[]) => {
                return Promise.resolve(users)
            })

            spyOn(target.debugElement.injector.get(UserService), "isInvitationSent").and.returnValue(Promise.resolve(true))
            spyOn(target.debugElement.injector.get(UserService), "isActivationPendingByUserId").and.returnValue(Promise.resolve(true))

            component.getAllMembers().then((members: User[]) => {
                expect(members.length).toBe(3);
                expect(members.every(m => m.isInvitationSent === true)).toBe(true)
                expect(members.every(m => m.isActivationPending === true)).toBe(true)
                expect(members.every(m => m.isDeleted === false)).toBe(true)
            })

        }));

        it("should retrieve members information when user retrieval fails", async(() => {
            component.team = new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] });

            spyOn(target.debugElement.injector.get(UserFactory), "get").and.callFake((id: string) => {
                return (Number.parseInt(id) % 2)
                    ? Promise.resolve(new User({ user_id: id, name: `User ${id}` }))
                    : Promise.reject("Can't find user")
            })

            component.getAllMembers().then((members: User[]) => {
                expect(members.length).toBe(2);

                expect(members.every(m => m.isInvitationSent === true)).toBe(true)
                expect(members.every(m => m.isActivationPending === true)).toBe(true)
                expect(members.every(m => m.isDeleted === false)).toBe(true)
            })

        }));

        it("should retrieve members information when invitation status fails ", async(() => {
            component.team = new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] });

            spyOn(target.debugElement.injector.get(UserService), "getUsersInfo").and.returnValue((users: User[]) => {
                return Promise.resolve(users.map(u => { u.isInvitationSent = false; return u }))
            })

            component.getAllMembers().then((members: User[]) => {
                expect(members.length).toBe(3);
                expect(members.every(m => m.isInvitationSent === false)).toBe(true)
                expect(members.every(m => m.isActivationPending === true)).toBe(true)
                expect(members.every(m => m.isDeleted === true)).toBe(true)
            })

        }));

        it("should retrieve members information when activation pending status fails ", async(() => {
            component.team = new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] });

            spyOn(target.debugElement.injector.get(UserService), "getUsersInfo").and.returnValue((users: User[]) => {
                return Promise.resolve(users.map(u => { u.isActivationPending = false; return u }))
            })

            component.getAllMembers().then((members: User[]) => {
                expect(members.length).toBe(3);
                expect(members.every(m => m.isInvitationSent === true)).toBe(true)
                expect(members.every(m => m.isActivationPending === false)).toBe(true)
                expect(members.every(m => m.isDeleted === true)).toBe(true)
            })

        }));
    });

    describe("invite", () => {
        // describe("invideUser", () => {
        //     it("should send invitation email and update status when it succeeds", () => {
        //         component.team = new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] });
        //         component.user = new User({ name: "Founder" })
        //         let spySendInvite = spyOn(target.debugElement.injector.get(UserService), "sendInvite").and.returnValue(Promise.resolve(true))

        //         let user = new User({ user_id: "1", email: "jane@doe.com", firstname: "Jane", lastname: "Doe", name: "Jane Doe" });
        //         component.inviteUser(user);

        //         expect(spySendInvite).toHaveBeenCalledWith("jane@doe.com", "1", "Jane", "Doe", "Jane Doe", "My team", "Founder");
        //         spySendInvite.calls.mostRecent().returnValue.then(() => {
        //             expect(user.isInvitationSent).toBe(true)
        //         })
        //     });
        // });

        // describe("invteAll", () => {
        //     it("should call the correct dependencies", async(() => {
        //         component.members$ = Promise.resolve([
        //             new User({ user_id: "1", isActivationPending: true }),
        //             new User({ user_id: "2", isActivationPending: false }),
        //             new User({ user_id: "3", isActivationPending: true })]);

        //         spyOn(component, "inviteUser");
        //         component.inviteAll();
        //         component.members$.then(() => {
        //             expect(component.inviteUser).toHaveBeenCalledTimes(2)
        //         })

        //     }));
        // });

        // describe("resend", () => {
        //     it("should call the correct dependencies", async(() => {
        //         spyOn(component, "inviteUser").and.returnValue(Promise.resolve())
        //         let user = new User({ user_id: "1", email: "jane@doe.com", firstname: "Jane", lastname: "Doe", name: "Jane Doe" });
        //         component.resendUser(user);

        //         expect(component.inviteUser).toHaveBeenCalledWith(user);

        //     }));
        // });

    });

    describe("delete", () => {
        it("should remote user,  update team and refresh page when there is more than one member left", async(() => {
            component.team = new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] });
            let user = new User({ user_id: "2" })

            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let spyUpsert = spyOn(mockTeamFactory, "upsert").and.returnValue(Promise.resolve(true))
            spyOn(component, "getAllMembers")
            component.deleteMember(user);
            expect(component.team.members.length).toBe(2)
            expect(mockTeamFactory.upsert).toHaveBeenCalledWith(component.team)
            spyUpsert.calls.mostRecent().returnValue.then(() => {
                expect(component.getAllMembers).toHaveBeenCalled();
            })
        }));

        it("should not remove member when there is  only one member left", async(() => {
            component.team = new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" })] });
            let user = new User({ user_id: "1" })

            let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
            let spyUpsert = spyOn(mockTeamFactory, "upsert").and.returnValue(Promise.resolve(true))
            spyOn(component, "getAllMembers")
            component.deleteMember(user);
            expect(component.team.members.length).toBe(1)
            expect(mockTeamFactory.upsert).not.toHaveBeenCalledWith(component.team);
        }));
    });



    xdescribe("createUser", () => {
        it("should do nothing if the form is invalid", () => {
            component.inviteForm.setValue({
                firstname: "", lastname: ""
            });
            spyOn(component, "createUserFullDetails");

            component.createUser("one@company.com");
            expect(component.createUserFullDetails).not.toHaveBeenCalled();
        });

        it("should call the correct dependencies if the form is valid", () => {
            component.inviteForm.setValue({
                firstname: "one", lastname: "Last"
            });
            component.inviteForm.markAsDirty();
            let spy = spyOn(component, "createUserFullDetails").and.returnValue(Promise.resolve(true));
            spyOn(component, "getAllMembers")
            component.createUser("one@company.com");

            expect(component.createUserFullDetails).toHaveBeenCalledWith("one@company.com", "one", "Last");
            spy.calls.mostRecent().returnValue.then(() => {
                expect(component.getAllMembers).toHaveBeenCalledTimes(1)
            })

        });
    });
});