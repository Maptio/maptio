import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { MailingService } from "./../../shared/services/mailing/mailing.service";
import { JwtEncoder } from "./../../shared/services/encoding/jwt.service";
import { AuthConfiguration } from "./../../shared/services/auth/auth.config";
import { UserService } from "./../../shared/services/user/user.service";
import { UserFactory } from "./../../shared/services/user.factory";
import { Observable } from "rxjs/Rx";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { TeamFactory } from "./../../shared/services/team.factory";
import { ActivatedRoute } from "@angular/router";
import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { TeamComponent } from "./team.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ErrorService } from "../../shared/services/error/error.service";
import { User } from "../../shared/model/user.data";
import { Team } from "../../shared/model/team.data";
import { Auth } from "../../shared/services/auth/auth.service";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { Angulartics2Mixpanel, Angulartics2, Angulartics2Module } from "angulartics2";
import { RouterTestingModule } from "@angular/router/testing";

export class AuthStub {
    fakeProfile: User = new User({
        name: "John Doe", email: "johndoe@domain.com",
        picture: "http://seemyface.com/user.jpg", user_id: "someId",
        datasets: ["dataset1", "dataset2"], teams: ["team1", "team2"]
    });

    public getUser(): Observable<User> {
        // console.log("here")
        return Observable.of(this.fakeProfile);
    }

    authenticated() {
        return;
    }

    login() {
        return;
    }

    logout() {
        return;
    }
}

describe("team.component.ts", () => {
    let component: TeamComponent;
    let target: ComponentFixture<TeamComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TeamComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, Angulartics2Module]
        }).overrideComponent(TeamComponent, {
            set: {
                providers: [
                    TeamFactory, UserFactory, DatasetFactory, AuthConfiguration,
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
                    { provide: Auth, useClass: AuthStub },
                    MockBackend,
                    BaseRequestOptions,
                    ErrorService, UserService,
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            params: Observable.of({ teamid: 123 })
                        }
                    },
                    Angulartics2Mixpanel, Angulartics2
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TeamComponent);
        component = target.componentInstance;
        target.detectChanges();
    });

    describe("getAllMembers", () => {
        it("should retrieve members information ", async(() => {
            component.team$ = Promise.resolve(new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] }))

            let spyGetUser = spyOn(target.debugElement.injector.get(UserService), "getUsersInfo").and.returnValue((users: User[]) => {
                return Promise.resolve(users)
            })

            let spyGetInvitationSent = spyOn(target.debugElement.injector.get(UserService), "isInvitationSent").and.returnValue(Promise.resolve(true))
            let spyActivationPending = spyOn(target.debugElement.injector.get(UserService), "isActivationPendingByUserId").and.returnValue(Promise.resolve(true))

            component.getAllMembers().then(members => {
                expect(members.length).toBe(3);
                expect(members.every(m => m.isInvitationSent === true)).toBe(true)
                expect(members.every(m => m.isActivationPending === true)).toBe(true)
                expect(members.every(m => m.isDeleted === false)).toBe(true)
            })

        }));

        it("should retrieve members information when user retrieval fails", async(() => {
            component.team$ = Promise.resolve(new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] }))

            let spyGetUser = spyOn(target.debugElement.injector.get(UserFactory), "get").and.callFake((id: string) => {
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
            component.team$ = Promise.resolve(new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] }))

            let spyGetUser = spyOn(target.debugElement.injector.get(UserService), "getUsersInfo").and.returnValue((users: User[]) => {
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
            component.team$ = Promise.resolve(new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] }))

            let spyGetUser = spyOn(target.debugElement.injector.get(UserService), "getUsersInfo").and.returnValue((users: User[]) => {
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
            component.team$ = Promise.resolve(new Team({ team_id: "ID", name: "My team", members: [new User({ user_id: "1" }), new User({ user_id: "2" }), new User({ user_id: "3" })] }))
            component.user = new User({ name: "Founder" })
            let spySendInvite = spyOn(target.debugElement.injector.get(UserService), "sendInvite").and.returnValue(Promise.resolve(true))

            let user = new User({ user_id: "1", email: "jane@doe.com", firstname: "Jane", lastname: "Doe", name: "Jane Doe" });
            component.inviteUser(user);

            component.team$.then(t => {
                expect(spySendInvite).toHaveBeenCalledWith("jane@doe.com", "1", "Jane", "Doe", "Jane Doe", "My team", "Founder");
                spySendInvite.calls.mostRecent().returnValue.then(() => {
                    expect(user.isInvitationSent).toBe(true)
                })

            })
        });
    });
});