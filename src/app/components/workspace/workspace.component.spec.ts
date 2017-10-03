import { AuthModule, authHttpServiceFactory } from "./../../shared/services/auth/auth.module";
import { encodeTestToken } from "angular2-jwt/angular2-jwt-test-helpers";
import { AuthConfig, tokenNotExpired } from "angular2-jwt";
import { AuthHttp, JwtHelper } from "angular2-jwt";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { EmitterService } from "./../../shared/services/emitter.service";
import { Initiative } from "./../../shared/model/initiative.data";
import { DataSet } from "./../../shared/model/dataset.data";
import { TeamFactory } from "./../../shared/services/team.factory";
import { Params } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { WorkspaceComponent } from "./workspace.component";
import { UserFactory } from "./../../shared/services/user.factory";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA, EventEmitter } from "@angular/core"
import { By } from "@angular/platform-browser";
import { BuildingComponent } from "../../components/building/building.component"
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { DataService } from "../../shared/services/data.service";
import { ErrorService } from "../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { Team } from "../../shared/model/team.data";
import { User } from "../../shared/model/user.data";
import { Auth } from "../../shared/services/auth/auth.service";
import { AuthHttpInterceptor } from "../../shared/services/auth/authHttpInterceptor";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";


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

describe("workspace.component.ts", () => {

    let component: WorkspaceComponent;
    let target: ComponentFixture<WorkspaceComponent>;

    beforeEach(async(() => {


        TestBed.configureTestingModule({
            imports: [NgbModule.forRoot()],
            declarations: [WorkspaceComponent, BuildingComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(WorkspaceComponent, {
            set: {
                providers: [DataService, DatasetFactory, UserFactory, TeamFactory,
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
                    { provide: Auth, useClass: AuthStub },
                    ErrorService,
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            params: Observable.of({ mapid: 123, slug: "slug" })
                        }
                    }]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(WorkspaceComponent);
        component = target.componentInstance;

    });

    describe("View", () => {
        describe("Map your initiative panel", () => {

            // it("should call toggle building panel ", () => {

            //     target.detectChanges();
            //     let togglingElement = target.debugElement.query(By.css(".toggle .btn"));
            //     let spy = spyOn(component, "toggleBuildingPanel").and.callThrough();

            //     let toggledElement = target.debugElement.query(By.css(".edit-map .btn i"));
            //     expect((toggledElement.nativeElement as HTMLElement).className).toContain("fa-chevron-right");

            //     togglingElement.triggerEventHandler("click", null);
            //     target.detectChanges();

            //     toggledElement = target.debugElement.query(By.css(".toggle .btn"));
            //     expect((toggledElement.nativeElement as HTMLElement).className).toContain("fa-times");

            //     togglingElement.triggerEventHandler("click", null);
            //     target.detectChanges();

            //     toggledElement = target.debugElement.query(By.css(".edit-map .btn i"));
            //     expect((toggledElement.nativeElement as HTMLElement).className).toContain("fa-chevron-right");

            //     expect(spy).toHaveBeenCalledTimes(2);
            // });
        })
    });

    describe("Controller", () => {
        describe("update team members", () => {
            it("should get the list of members when team is defined", () => {
                component.team = Promise.resolve(new Team({ name: "Winners", members: [new User({ user_id: "1" })], team_id: "some_team_id" }));
                component.updateTeamMembers();
                component.members.then(m => {
                    expect(m.length).toBe(1);
                    expect(m[0].user_id).toBe("1")
                })
            });
        })

        describe("adding team to initiative", () => {
            it("should add team to current dataset and update team members", () => {
                let spy = spyOn(component, "updateTeamMembers")
                component.dataset$ = Promise.resolve(new DataSet({ _id: "some_dataset_id", initiative: new Initiative() }))

                let team = new Team({ name: "Winners", members: [], team_id: "some_team_id" })

                component.dataset$.then((d) => {
                    expect(d.initiative.team_id).toBeUndefined();
                })
                component.addTeamToInitiative(team)
                component.dataset$.then((d) => {
                    expect(d.initiative.team_id).toBe("some_team_id")
                })
                expect(spy).toHaveBeenCalled();

            })


            it("should load data in building component", () => {
                let mockFactory = target.debugElement.injector.get(DatasetFactory);
                let spyUpsert = spyOn(mockFactory, "upsert").and.returnValue(Promise.resolve(true))

                let spyLoadData = spyOn(component.buildingComponent, "loadData")
                component.dataset$ = Promise.resolve(new DataSet({ _id: "some_dataset_id", initiative: new Initiative() }))

                let team = new Team({ name: "Winners", members: [], team_id: "some_team_id" })

                component.addTeamToInitiative(team)
                component.dataset$.then((d) => {
                    expect(true).toBeTruthy();
                    expect(spyUpsert).toHaveBeenCalled();
                    spyUpsert.calls.mostRecent().returnValue.then(() => {
                        expect(spyLoadData).toHaveBeenCalledWith("some_dataset_id")
                    })
                })

            })

        })

        describe("toggleBuildingPanel", () => {
            it("should change value of isBuildingPanelCollapsed when calling toggleBuildingPanel", () => {
                expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();
                component.toggleBuildingPanel();
                expect(target.componentInstance.isBuildingPanelCollapsed).toBeFalsy();
                component.toggleBuildingPanel();
                expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();

            });
        });

        describe("ngOnInit", () => {


            it("loads dataset matching :id", async(() => {

                // let spy = spyOn(component.buildingComponent, "loadData");
                let mockRoute: ActivatedRoute = target.debugElement.injector.get(ActivatedRoute);
                let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
                let spyGet = spyOn(mockDataSetFactory, "get").and.returnValue(Promise.resolve(new DataSet({ _id: "123", initiative: new Initiative({ team_id: "team1" }) })));

                component.ngOnInit();

                mockRoute.params.toPromise().then((params: Params) => {
                    // expect(spy).toHaveBeenCalledWith(123, "slug");
                    expect(spyGet).toHaveBeenCalled();
                    spyGet.calls.mostRecent().returnValue.then(() => {
                        expect(spyGet).toHaveBeenCalledWith(123)
                    })
                    component.dataset$.then((r) => {
                        expect(r).toEqual(new DataSet({ _id: "123", initiative: new Initiative({ team_id: "team1" }) }))
                    })
                });

            }));

            it("loads team matching dataset", async(() => {

                // let spy = spyOn(component.buildingComponent, "loadData");
                let mockRoute: ActivatedRoute = target.debugElement.injector.get(ActivatedRoute);
                let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
                let mockUserFactory = target.debugElement.injector.get(UserFactory);
                let spyGetDataset = spyOn(mockDataSetFactory, "get").and.returnValue(Promise.resolve(new DataSet({ _id: "123", initiative: new Initiative({ team_id: "team_id" }) })));

                let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
                let spyGetTeam = spyOn(mockTeamFactory, "get").and.returnValue(Promise.resolve(new Team({ team_id: "team_id", name: "Winners", members: [new User({ user_id: "1" })] })))
                let spyGetUser = spyOn(mockUserFactory, "get").and.returnValue(Promise.resolve(new User({ user_id: "id" })));

                component.ngOnInit();

                mockRoute.params.toPromise().then((params: Params) => {
                    // expect(spy).toHaveBeenCalledWith(123, "slug");
                    expect(spyGetDataset).toHaveBeenCalled();
                    spyGetDataset.calls.mostRecent().returnValue.then(() => {
                        expect(spyGetDataset).toHaveBeenCalledWith(123);

                        expect(spyGetTeam).toHaveBeenCalledWith("team_id");
                        component.team.then((r) => {
                            expect(r).toEqual(new Team({ team_id: "team_id", name: "Winners", members: [new User({ user_id: "1" })] }))
                            expect(spyGetUser).toHaveBeenCalledTimes(1);
                            expect(spyGetUser).toHaveBeenCalledWith("1")
                        })
                    })
                });

            }));

            it("loads members from team", async(() => {

                // let spy = spyOn(component.buildingComponent, "loadData");
                let mockRoute: ActivatedRoute = target.debugElement.injector.get(ActivatedRoute);
                let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
                let mockUserFactory = target.debugElement.injector.get(UserFactory);
                let mockTeamFactory = target.debugElement.injector.get(TeamFactory);

                let spyGetDataset = spyOn(mockDataSetFactory, "get").and.returnValue(Promise.resolve(new DataSet({ _id: "123", initiative: new Initiative({ team_id: "team_id" }) })));
                let spyGetUser = spyOn(mockUserFactory, "get").and.returnValue(Promise.resolve(new User({ user_id: "id" })));
                let spyGetTeam = spyOn(mockTeamFactory, "get").and.returnValue(Promise.resolve(new Team({ members: [new User({ user_id: "1" })] })));

                component.ngOnInit();

                mockRoute.params.toPromise().then((params: Params) => {
                    // expect(spy).toHaveBeenCalledWith(123, "slug");
                    expect(spyGetDataset).toHaveBeenCalled();
                    spyGetDataset.calls.mostRecent().returnValue.then(() => {
                        expect(spyGetDataset).toHaveBeenCalledWith(123);

                        expect(spyGetTeam).toHaveBeenCalledWith("team_id");

                        component.team.then((r) => {
                            // expect(r).toEqual(new Team({ team_id: "team_id", name: "Winners", members: [new User({ user_id: "1" })] }))
                            expect(spyGetUser).toHaveBeenCalledTimes(1);
                            expect(spyGetUser).toHaveBeenCalledWith("1");
                            component.members.then((members) => {
                                expect(members.length).toBe(1)
                            })
                        })
                    })
                });

            }));
        });

    });











});
