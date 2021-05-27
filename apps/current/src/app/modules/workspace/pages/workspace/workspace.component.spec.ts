
import {of as observableOf,  Observable } from 'rxjs';
import { RouterTestingModule } from "@angular/router/testing";
import { AuthHttp } from "angular2-jwt";
import { Initiative } from "../../../../shared/model/initiative.data";
import { DataSet } from "../../../../shared/model/dataset.data";
import { ActivatedRoute } from "@angular/router";
import { WorkspaceComponent } from "./workspace.component";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core"
import { ErrorService } from "../../../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { Team } from "../../../../shared/model/team.data";
import { User } from "../../../../shared/model/user.data";
import { Auth } from "../../../../core/authentication/auth.service";
import { authHttpServiceFactoryTesting } from "../../../../core/mocks/authhttp.helper.shared";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { NgProgress } from "@ngx-progressbar/core";
import { WorkspaceModule } from "../../workspace.module";
import { AnalyticsModule } from "../../../../core/analytics.module";
import { CoreModule } from "../../../../core/core.module";
import { SharedModule } from "../../../../shared/shared.module";

export class AuthStub {
    fakeProfile: User = new User({
        name: "John Doe", email: "johndoe@domain.com",
        picture: "http://seemyface.com/user.jpg", user_id: "someId",
        datasets: ["dataset1", "dataset2"], teams: ["team1", "team2"]
    });

    public getUser(): Observable<User> {
        return observableOf(this.fakeProfile);
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
            imports: [RouterTestingModule, AnalyticsModule, WorkspaceModule, CoreModule, SharedModule.forRoot()],
            declarations: [],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(WorkspaceComponent, {
            set: {
                providers: [
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
                        provide: LoaderService,
                        useClass: class {
                            hide = jest.fn()
                            show = jest.fn()
                        },
                        deps: [NgProgress]
                    },
                    MockBackend,
                    BaseRequestOptions,
                    { provide: Auth, useClass: AuthStub },
                    ErrorService,
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            params: observableOf({ mapid: 123, slug: "slug" }),
                            data: observableOf({
                                data: {
                                    dataset:
                                    new DataSet({ datasetId: "123", initiative: new Initiative() }),
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
 
        // describe("toggleBuildingPanel", () => {
        //     it("should change value of isBuildingPanelCollapsed when calling toggleBuildingPanel", () => {
        //         expect(component.isBuildingPanelCollapsed).toBeTruthy();
        //         component.toggleBuildingPanel();
        //         expect(component.isBuildingPanelCollapsed).toBeFalsy();
        //         component.toggleBuildingPanel();
        //         expect(component.isBuildingPanelCollapsed).toBeTruthy();
        //     });
        // });

        // describe("toggleDetailsPanel", () => {
        //      xit("should toggle", () => {
        //         expect(component.isDetailsPanelCollapsed).toBeTruthy();
        //         component.toggleDetailsPanel();
        //         expect(component.isDetailsPanelCollapsed).toBeFalsy();
        //         component.toggleDetailsPanel();
        //         expect(component.isDetailsPanelCollapsed).toBeTruthy();
        //     });
        // });

        describe("closeEditingPanel", () => {
            xit("should call correct dependencies", () => {
                component.closeDetailsPanel();
                expect(component.isDetailsPanelCollapsed).toBe(true);
                expect(component.isBuildingPanelCollapsed).toBe(true);
            });
        });

        describe("saveDetailsChange", () => {
            xit("should call saveChanges", () => {
                spyOn(component.buildingComponent, "saveChanges");
                component.saveDetailChanges();
                expect(component.buildingComponent.saveChanges).toHaveBeenCalled();
            });
        });

        describe("openDetails", () => {
            xit("should call correct dependencies and keep building panel opened", async(() => {
                component.dataset = new DataSet({ initiative: new Initiative({ id: 1, name: "Name", children: [new Initiative({ id: 2, name: "opening" })] }) });
                component.team = new Team({ team_id: "1", name: "Team" });

                component.onOpenDetails(new Initiative({ name: "opening", id: 2 }))

                expect(component.openedNode.name).toBe("opening");
                expect(component.isDetailsPanelCollapsed).toBe(false);
                expect(component.isBuildingPanelCollapsed).toBe(false);

            }));

            xit("should call correct dependencies and keep building panel closed", async(() => {
                component.dataset = new DataSet({ initiative: new Initiative({ id: 1, name: "Name", children: [new Initiative({ id: 2, name: "opening" })] }) });
                component.team = new Team({ team_id: "1", name: "Team" });

                component.onOpenDetails(new Initiative({ name: "opening", id: 2 }))

                expect(component.openedNode.name).toBe("opening");
                expect(component.isDetailsPanelCollapsed).toBe(false);
                expect(component.isBuildingPanelCollapsed).toBe(true);

            }));
        });

        describe("addInitiatives", () => {
            xit("should call correct dependencies", () => {
                spyOn(component.buildingComponent, "addNodeTo")
                component.addInitiative({ node : new Initiative({}), subNode : new Initiative({})});
                expect(component.buildingComponent.addNodeTo).toHaveBeenCalled();
            });
        });

        describe("removeInitiative", () => {
            xit("should call correct dependencies", () => {
                spyOn(component.buildingComponent, "removeNode")
                component.removeInitiative(new Initiative({}));
                expect(component.buildingComponent.removeNode).toHaveBeenCalled();
            });
        });

        describe("moveInitiative", () => {
            xit("should call correct dependencies", () => {
                spyOn(component.buildingComponent, "moveNode")
                component.moveInitiative({ node: new Initiative({}), from: new Initiative({}), to: new Initiative({}) });
                expect(component.buildingComponent.moveNode).toHaveBeenCalled();
            });
        });
    });

});