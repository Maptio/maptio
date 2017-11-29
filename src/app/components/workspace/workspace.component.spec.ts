import { MailingService } from "./../../shared/services/mailing/mailing.service";
import { AuthConfiguration } from "./../../shared/services/auth/auth.config";
import { RouterTestingModule } from "@angular/router/testing";
import { Angulartics2, Angulartics2Mixpanel } from "angulartics2";
import { AuthModule, authHttpServiceFactory } from "./../../shared/services/auth/auth.module";
import { encodeTestToken } from "angular2-jwt/angular2-jwt-test-helpers";
import { AuthConfig, tokenNotExpired } from "angular2-jwt";
import { AuthHttp, JwtHelper } from "angular2-jwt";
import { NgbModule, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EmitterService } from "./../../shared/services/emitter.service";
import { Initiative } from "./../../shared/model/initiative.data";
import { DataSet } from "./../../shared/model/dataset.data";
import { TeamFactory } from "./../../shared/services/team.factory";
import { Params } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { WorkspaceComponent } from "./workspace.component";
import { UserFactory } from "./../../shared/services/user.factory";
import { ComponentFixture, TestBed, async, fakeAsync } from "@angular/core/testing";
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
import { UserService } from "../../shared/services/user/user.service";
import { JwtEncoder } from "../../shared/services/encoding/jwt.service";


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
            imports: [NgbModule.forRoot(), RouterTestingModule],
            declarations: [WorkspaceComponent, BuildingComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(WorkspaceComponent, {
            set: {
                providers: [DataService, DatasetFactory, UserService, AuthConfiguration, JwtEncoder, MailingService, UserFactory, TeamFactory, Angulartics2, Angulartics2Mixpanel,
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
                    MockBackend, NgbModal,
                    BaseRequestOptions,
                    { provide: Auth, useClass: AuthStub },
                    ErrorService,
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            params: Observable.of({ mapid: 123, slug: "slug" }),
                            data: Observable.of({
                                data: {
                                    dataset:
                                    new DataSet({ _id: "123" }),
                                    team: new Team({ team_id: "team123", name: "team" }),
                                    members: []
                                }
                            })
                        }
                    }]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(WorkspaceComponent);
        component = target.componentInstance;

        target.detectChanges();

    });

    describe("Controller", () => {

        // describe("update team members", () => {
        //     it("should get the list of members when team is defined", () => {
        //         component.team$ = Promise.resolve(new Team({ name: "Winners", members: [new User({ user_id: "1" })], team_id: "some_team_id" }));
        //         component.updateTeamMembers();
        //         component.members.then(m => {
        //             expect(m.length).toBe(1);
        //             expect(m[0].user_id).toBe("1")
        //         })
        //     });
        // })

        // describe("adding team to initiative", () => {
        //     it("should add team to current dataset and update team members", async(() => {
        //         let spyModal = spyOn(target.debugElement.injector.get(NgbModal), "open").and.returnValue({ result: Promise.resolve(true) })
        //         let spy = spyOn(component, "updateTeamMembers")
        //         component.dataset$ = Promise.resolve(new DataSet({ _id: "some_dataset_id", initiative: new Initiative() }))

        //         let team = new Team({ name: "Winners", members: [], team_id: "some_team_id" })

        //         component.dataset$.then((d) => {
        //             expect(d.initiative.team_id).toBeUndefined();
        //         })
        //         component.addTeamToInitiative(team)

        //         spyModal.calls.mostRecent().returnValue.result.then(() => {
        //             component.dataset$.then((d) => {
        //                 expect(d.initiative.team_id).toBe("some_team_id")
        //             })
        //             expect(spy).toHaveBeenCalled();
        //         })
        //     }))


        //     it("should load data in building component", async(() => {
        //         let spyModal = spyOn(target.debugElement.injector.get(NgbModal), "open").and.returnValue({ result: Promise.resolve(true) })
        //         let mockFactory = target.debugElement.injector.get(DatasetFactory);
        //         let spyUpsert = spyOn(mockFactory, "upsert").and.returnValue(Promise.resolve(true))

        //         let spyLoadData = spyOn(component.buildingComponent, "loadData")
        //         component.dataset$ = Promise.resolve(new DataSet({ _id: "some_dataset_id", initiative: new Initiative() }))

        //         let team = new Team({ name: "Winners", members: [], team_id: "some_team_id" })

        //         component.addTeamToInitiative(team)
        //         spyModal.calls.mostRecent().returnValue.result.then(() => {
        //             component.dataset$.then((d) => {
        //                 expect(true).toBeTruthy();
        //                 expect(spyUpsert).toHaveBeenCalled();
        //                 spyUpsert.calls.mostRecent().returnValue.then(() => {
        //                     expect(spyLoadData).toHaveBeenCalledWith("some_dataset_id")
        //                 })
        //             })
        //         })
        //     }))

        // })

        describe("toggleBuildingPanel", () => {
            it("should change value of isBuildingPanelCollapsed when calling toggleBuildingPanel", () => {
                expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();
                component.toggleBuildingPanel();
                expect(target.componentInstance.isBuildingPanelCollapsed).toBeFalsy();
                component.toggleBuildingPanel();
                expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();

            });
        });

        describe("toggleDetailsPanel", () => {
            it("should behave...", () => {
                component.isDetailsPanelCollapsed = true;
                component.toggleDetailsPanel();
                expect(component.isDetailsPanelCollapsed).toBe(false);
                component.toggleDetailsPanel();
                expect(component.isDetailsPanelCollapsed).toBe(true);
            });
        });

        describe("closeEditingPanel", () => {
            it("should call correct dependencies", () => {
                component.closeEditingPanel();
                expect(component.isDetailsPanelCollapsed).toBe(true);
                expect(component.isBuildingPanelCollapsed).toBe(true);
            });
        });

        describe("saveDetailsChange", () => {
            it("should call saveChanges", () => {
                spyOn(component.buildingComponent, "saveChanges");
                component.saveDetailChanges();
                expect(component.buildingComponent.saveChanges).toHaveBeenCalled();
            });
        });

        describe("openDetails", () => {
            it("should call correct dependencies and keep building panel opened", async(() => {
                component.dataset = new DataSet({ initiative: new Initiative({ id: 1, name: "Name", children: [new Initiative({ id: 2, name: "opening" })] }) });
                component.team = new Team({ team_id: "1", name: "Team" });

                component.openDetails(new Initiative({ name: "opening", id: 2 }))

                // Promise.all([component.dataset$, component.team$]).then(() => {
                expect(component.openedNode.name).toBe("opening");
                expect(component.openedNodeParent.name).toBe("Name")
                // })
                //     .then(() => {
                expect(component.isDetailsPanelCollapsed).toBe(false);
                expect(component.isBuildingPanelCollapsed).toBe(false);
                // })

            }));

            it("should call correct dependencies and keep building panel closed", async(() => {
                component.dataset = new DataSet({ initiative: new Initiative({ id: 1, name: "Name", children: [new Initiative({ id: 2, name: "opening" })] }) });
                component.team = new Team({ team_id: "1", name: "Team" });

                component.openDetails(new Initiative({ name: "opening", id: 2 }), true)

                // Promise.all([component.dataset$, component.team$]).then(() => {
                expect(component.openedNode.name).toBe("opening");
                expect(component.openedNodeParent.name).toBe("Name")
                // })
                //     .then(() => {
                expect(component.isDetailsPanelCollapsed).toBe(false);
                expect(component.isBuildingPanelCollapsed).toBe(true);
                // })

            }));
        });

        describe("addInitiatives", () => {
            it("should call correct dependencies", () => {
                spyOn(component.buildingComponent, "addNodeTo")
                component.addInitiative(new Initiative({}));
                expect(component.buildingComponent.addNodeTo).toHaveBeenCalled();
            });
        });

        describe("removeInitiative", () => {
            it("should call correct dependencies", () => {
                spyOn(component.buildingComponent, "removeNode")
                component.removeInitiative(new Initiative({}));
                expect(component.buildingComponent.removeNode).toHaveBeenCalled();
            });
        });

        describe("moveInitiative", () => {
            it("should call correct dependencies", () => {
                spyOn(component.buildingComponent, "moveNode")
                component.moveInitiative({ node: new Initiative({}), from: new Initiative({}), to: new Initiative({}) });
                expect(component.buildingComponent.moveNode).toHaveBeenCalled();
            });
        });
    });

});