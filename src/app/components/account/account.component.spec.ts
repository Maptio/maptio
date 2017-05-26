import { Team } from './../../shared/model/team.data';
import { TeamFactory } from './../../shared/services/team.factory';
import { Observable } from "rxjs/Rx";
import { User } from "./../../shared/model/user.data";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { ErrorService } from "./../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { UserFactory } from "./../../shared/services/user.factory";
import { Auth } from "./../../shared/services/auth/auth.service";
import { AccountComponent } from "./account.component";
import { DataSet } from "./../../shared/model/dataset.data";
import { Router } from "@angular/router";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core"
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

export class AuthStub {
    fakeProfile: User = new User({ name: "John Doe", email: "johndoe@domain.com", picture: "http://seemyface.com/user.jpg", user_id: "someId", datasets: ["one", "two"], teams: ["team1", "team2"] });

    public getUser(): Observable<User> {
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

describe("account.component.ts", () => {

    let component: AccountComponent;
    let target: ComponentFixture<AccountComponent>;
    let DATASETS = [new DataSet({ name: "One", _id: "one" }), new DataSet({ name: "Two", _id: "two" }), new DataSet({ name: "Three", _id: "three" })];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AccountComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(AccountComponent, {
            set: {
                providers: [
                    { provide: Auth, useClass: AuthStub },
                    { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                    UserFactory, ErrorService, DatasetFactory, TeamFactory,
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                            return new Http(mockBackend, options);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    MockBackend,
                    BaseRequestOptions]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(AccountComponent);

        component = target.componentInstance;

        target.detectChanges();
    });

    describe("Controller", () => {

        describe("ngOnInit", () => {
            it("should retrieve user and matching datasets", async(() => {
                let mockAuth: Auth = target.debugElement.injector.get(Auth);
                let spyAuth = spyOn(mockAuth, "getUser").and.callThrough();

                let mockDatasetFactory: DatasetFactory = target.debugElement.injector.get(DatasetFactory);
                let spyFactory = spyOn(mockDatasetFactory, "get").and.callFake(function (parameters: any) {
                    if (parameters instanceof User) {
                        return Promise.resolve(DATASETS);
                    }
                    if (typeof parameters === "string") {
                        return Promise.resolve(new DataSet({ _id: parameters.toString(), name: "a dataset" }));
                    }
                });
                component.ngOnInit();
                spyAuth.calls.mostRecent().returnValue.toPromise().then((user: User) => {
                    expect(spyFactory).toHaveBeenCalledTimes(2);
                    component.datasets$.then(datasets => expect(datasets.length).toBe(2))
                });

            }));

            it("should retrieve user and matching teams", async(() => {
                let mockAuth: Auth = target.debugElement.injector.get(Auth);
                let spyAuth = spyOn(mockAuth, "getUser").and.callThrough();

                let mockTeamFactory: TeamFactory = target.debugElement.injector.get(TeamFactory);
                let spyFactory = spyOn(mockTeamFactory, "get").and.callFake(function (teamId: any) {

                    return Promise.resolve(new Team({ name: "a team", team_id: teamId }));

                });
                component.ngOnInit();
                spyAuth.calls.mostRecent().returnValue.toPromise().then((user: User) => {
                    expect(spyFactory).toHaveBeenCalledTimes(2);
                    component.teams$.then(teams => expect(teams.length).toBe(2))
                });

            }));

            it("should call error service if authentication doesnt return user", async(() => {
                let errorMsg = "Authentication failed";
                let mockAuth: Auth = target.debugElement.injector.get(Auth);
                let mockError: ErrorService = target.debugElement.injector.get(ErrorService);
                let spyAuth = spyOn(mockAuth, "getUser").and.callFake(function () { return Observable.throw(errorMsg) })
                let spyError = spyOn(mockError, "handleError");

                component.ngOnInit();
                expect(spyAuth).toHaveBeenCalledTimes(1);
                expect(spyError).toHaveBeenCalledWith(errorMsg);
            }));
        });

        describe("delete", () => {
            it("should call factory for deletion and display succesful message when it succeeds", async(() => {
                let error = target.debugElement.injector.get(ErrorService);
                let spyError = spyOn(error, "handleError");
                let factory = target.debugElement.injector.get(DatasetFactory);
                let spy = spyOn(factory, "delete").and.returnValue(Promise.resolve<boolean>(true));

                let dataset = new DataSet({ _id: "unique_id", name: "Some data" });
                component.deleteDataset(dataset)
                spy.calls.mostRecent().returnValue.then(() => {
                    expect(spy).toHaveBeenCalledWith(dataset, jasmine.objectContaining({ user_id: "someId" }));
                    expect(spyError).not.toHaveBeenCalled();
                });

            }));

            it("should call factory for deletion and calls errorservice when it fails", async(() => {
                let factory = target.debugElement.injector.get(DatasetFactory);
                let error = target.debugElement.injector.get(ErrorService);
                let spyError = spyOn(error, "handleError");
                let spy = spyOn(factory, "delete").and.returnValue(Promise.resolve<boolean>(false));

                let dataset = new DataSet({ _id: "unique_id", name: "Some data" });
                component.deleteDataset(dataset);

                spy.calls.mostRecent().returnValue.then(() => {
                    expect(spy).toHaveBeenCalledWith(dataset, jasmine.objectContaining({ user_id: "someId" }));
                    expect(spyError).toHaveBeenCalled();
                });

            }));
        });

        describe("open", () => {
            it("should navigate to workspace with dataset ID", () => {
                let router = target.debugElement.injector.get(Router);

                let dataset = new DataSet({ _id: "unique_id", name: "Some data" });
                component.open(dataset)
                expect(router.navigate).toHaveBeenCalledWith(["workspace", "unique_id"]);

            });
        });


        describe("createNewTeam", () => {
            it("should create a new team then link user with team", () => {
                let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
                let mockUserFactory = target.debugElement.injector.get(UserFactory);

                let spyCreateTeam = spyOn(mockTeamFactory, "create").and.returnValue(Promise.resolve(new Team({ team_id: "new_id", name: "JUST CREATED" })))
                let spyUserUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(true));

                component.createNewTeam("NEW TEAM");

                spyCreateTeam.calls.mostRecent().returnValue.then(() => {
                    expect(spyCreateTeam).toHaveBeenCalledWith(jasmine.objectContaining({
                        name: "NEW TEAM",
                        members: [jasmine.objectContaining({ name: "John Doe", user_id: "someId" })]
                    }));

                    expect(spyUserUpsert).toHaveBeenCalledWith(jasmine.objectContaining({
                        name: "John Doe",
                        user_id: "someId",
                        teams: jasmine.arrayContaining(["team1", "team2", "new_id"])
                    }));

                })
            });

            it("should call error service when team factory fails", async(() => {
                let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
                let mockUserFactory = target.debugElement.injector.get(UserFactory);
                let mockErrorService = target.debugElement.injector.get(ErrorService);

                let spyCreateTeam = spyOn(mockTeamFactory, "create").and.returnValue(Promise.reject("Creation failed"))
                let spyUserUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(true));
                let spyError = spyOn(mockErrorService, "handleError")

                component.createNewTeam("NEW TEAM");

                spyCreateTeam.calls.mostRecent().returnValue
                    .then(() => {
                        expect(spyUserUpsert).not.toHaveBeenCalled()
                    })
                    .catch((error: string) => {
                        expect(spyError).toHaveBeenCalledWith("Creation failed");
                    })
            }));

            it("should call error service when user factory fails", async(() => {
                let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
                let mockUserFactory = target.debugElement.injector.get(UserFactory);
                let mockErrorService = target.debugElement.injector.get(ErrorService);

                let spyCreateTeam = spyOn(mockTeamFactory, "create").and.returnValue(Promise.resolve(new Team({ team_id: "new_id", name: "JUST CREATED" })))
                let spyUserUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.reject(true));
                let spyError = spyOn(mockErrorService, "handleError")

                component.createNewTeam("NEW TEAM");

                spyCreateTeam.calls.mostRecent().returnValue
                    .then(() => {
                        expect(spyUserUpsert).toHaveBeenCalled();

                        spyUserUpsert.calls.mostRecent().returnValue
                            .then(() => {

                            }).catch((error: string) => {
                                expect(spyError).toHaveBeenCalledWith(true);
                            })
                    })
                    .catch((error: string) => {
                        expect(spyError).not.toHaveBeenCalled();
                    })
            }));


        });
    });




});
