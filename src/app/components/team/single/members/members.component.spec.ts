import { authHttpServiceFactoryTesting } from "../../../../../test/specs/shared/authhttp.helper.shared"
import { Angulartics2Mixpanel } from "angulartics2";
import { User } from "./../../../../shared/model/user.data";
import { Team } from "./../../../../shared/model/team.data";
import { Observable } from "rxjs/Rx";
import { UserService } from "./../../../../shared/services/user/user.service";
import { ErrorService } from "./../../../../shared/services/error/error.service";
import { Auth } from "./../../../../shared/services/auth/auth.service";
import { MockBackend } from "@angular/http/testing";
import { BaseRequestOptions } from "@angular/http";
import { Http } from "@angular/http";
import { AuthHttp } from "angular2-jwt";
import { MailingService } from "./../../../../shared/services/mailing/mailing.service";
import { JwtEncoder } from "./../../../../shared/services/encoding/jwt.service";
import { FileService } from "./../../../../shared/services/file/file.service";
import { AuthConfiguration } from "./../../../../shared/services/auth/auth.config";
import { UserFactory } from "./../../../../shared/services/user.factory";
import { DatasetFactory } from "./../../../../shared/services/dataset.factory";
import { TeamFactory } from "./../../../../shared/services/team.factory";
import { Angulartics2Module, Angulartics2 } from "angulartics2";
import { RouterTestingModule } from "@angular/router/testing";
import { NO_ERRORS_SCHEMA, Type } from "@angular/core";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { TeamMembersComponent } from "./members.component";
import { ActivatedRouteSnapshot, ActivatedRoute, UrlSegment, ParamMap, Params, Data, Route } from "@angular/router";

class MockActivatedRoute implements ActivatedRoute {
    paramMap: Observable<ParamMap>;
    queryParamMap: Observable<ParamMap>;
    snapshot: ActivatedRouteSnapshot;
    url: Observable<UrlSegment[]>;
    params: Observable<Params>;
    queryParams: Observable<Params>;
    fragment: Observable<string>;
    data: Observable<Data> = Observable.of({
        team: new Team({
            team_id: "123",
            name: "team",
            settings: { authority: "A", helper: "H" },
            members: [new User({ user_id: "1" }), new User({ user_id: "2" })]
        })
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
            declarations: [TeamMembersComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, Angulartics2Module]
        }).overrideComponent(TeamMembersComponent, {
            set: {
                providers: [
                    TeamFactory, UserFactory, DatasetFactory, AuthConfiguration, FileService,
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
                        provide: Auth, useClass: class {
                            getUser() { return Observable.of(new User({ user_id: "USER_ID" })) }
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

            component.getAllMembers().then(members => {
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


            // let spyGetInvitationSent = spyOn(target.debugElement.injector.get(UserService), "isInvitationSent").and.returnValue(Promise.resolve(true))
            // let spyActivationPending = spyOn(target.debugElement.injector.get(UserService), "isActivationPendingByUserId").and.returnValue(Promise.resolve(true))

            component.getAllMembers().then(members => {
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

            // let spyGetInvitationSent = spyOn(target.debugElement.injector.get(UserService), "isInvitationSent").and.returnValue(Promise.reject("Cant find user"))
            // let spyActivationPending = spyOn(target.debugElement.injector.get(UserService), "isActivationPendingByUserId").and.returnValue(Promise.resolve(true))

            component.getAllMembers().then(members => {
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
            // let spyGetInvitationSent = spyOn(target.debugElement.injector.get(UserService), "isActivationPendingByUserId").and.returnValue(Promise.reject("Cant find user"))
            // let spyActivationPending = spyOn(target.debugElement.injector.get(UserService), "isInvitationSent").and.returnValue(Promise.resolve(true))

            component.getAllMembers().then(members => {
                expect(members.length).toBe(3);
                expect(members.every(m => m.isInvitationSent === true)).toBe(true)
                expect(members.every(m => m.isActivationPending === false)).toBe(true)
                expect(members.every(m => m.isDeleted === true)).toBe(true)
            })

        }));
    });

    describe("inviteUser", () => {
        it("should send invitation email and update status when it succeeds", () => {
            component.team = new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] });
            component.user = new User({ name: "Founder" })
            let spySendInvite = spyOn(target.debugElement.injector.get(UserService), "sendInvite").and.returnValue(Promise.resolve(true))

            let user = new User({ user_id: "1", email: "jane@doe.com", firstname: "Jane", lastname: "Doe", name: "Jane Doe" });
            component.inviteUser(user);

            // component.team$.then(t => {
            expect(spySendInvite).toHaveBeenCalledWith("jane@doe.com", "1", "Jane", "Doe", "Jane Doe", "My team", "Founder");
            spySendInvite.calls.mostRecent().returnValue.then(() => {
                expect(user.isInvitationSent).toBe(true)
            })

            // })
        });
    });
});