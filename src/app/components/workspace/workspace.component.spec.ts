import { DataSet } from "./../../shared/model/dataset.data";
import { TeamFactory } from "./../../shared/services/team.factory";
import { Params } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { WorkspaceComponent } from "./workspace.component";
import { UserFactory } from "./../../shared/services/user.factory";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core"
import { By } from "@angular/platform-browser";
import { BuildingComponent } from "../../components/building/building.component"
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { DataService } from "../../shared/services/data.service";
import { ErrorService } from "../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import { Team } from "../../shared/model/team.data";
import { User } from "../../shared/model/user.data";

describe("workspace.component.ts", () => {

    let component: WorkspaceComponent;
    let target: ComponentFixture<WorkspaceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspaceComponent, BuildingComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(WorkspaceComponent, {
            set: {
                providers: [DataService, DatasetFactory, UserFactory, TeamFactory,
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
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            params: Observable.of({ workspaceid: 123, slug: "slug" })
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

            it("should call toggle building panel ", () => {

                target.detectChanges();
                let togglingElement = target.debugElement.query(By.css("h4.panel-title>a"));
                let spy = spyOn(component, "toggleBuildingPanel").and.callThrough();

                let toggledElement = target.debugElement.query(By.css("h4.panel-title>a i"));
                expect((toggledElement.nativeElement as HTMLElement).className).toContain("fa-plus-square");

                togglingElement.triggerEventHandler("click", null);
                target.detectChanges();

                toggledElement = target.debugElement.query(By.css("h4.panel-title>a i"));
                expect((toggledElement.nativeElement as HTMLElement).className).toContain("fa-minus-square");

                togglingElement.triggerEventHandler("click", null);
                target.detectChanges();

                toggledElement = target.debugElement.query(By.css("h4.panel-title>a i"));
                expect((toggledElement.nativeElement as HTMLElement).className).toContain("fa-plus-square");

                expect(spy).toHaveBeenCalledTimes(2);
            });
        })
    });

    describe("Controller", () => {

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
            it("loads data matching :id", async(() => {
                let spy = spyOn(component.buildingComponent, "loadData");
                let mockRoute: ActivatedRoute = target.debugElement.injector.get(ActivatedRoute);
                component.ngOnInit();
                mockRoute.params.toPromise().then((params: Params) => {
                    expect(spy).toHaveBeenCalledWith(123, "slug");
                });
            }));

            it("loads dataset matching :id", async(() => {

                let spy = spyOn(component.buildingComponent, "loadData");
                let mockRoute: ActivatedRoute = target.debugElement.injector.get(ActivatedRoute);
                let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
                let spyGet = spyOn(mockDataSetFactory, "get").and.returnValue(Promise.resolve(new DataSet({ _id: "123" })));

                component.ngOnInit();

                mockRoute.params.toPromise().then((params: Params) => {
                    expect(spy).toHaveBeenCalledWith(123, "slug");
                    expect(spyGet).toHaveBeenCalled();
                    spyGet.calls.mostRecent().returnValue.then(() => {
                        expect(spyGet).toHaveBeenCalledWith(123)
                    })
                    component.dataset.then((r) => {
                        expect(r).toEqual(new DataSet({ _id: "123" }))
                    })
                });

            }));

            it("loads team matching dataset", async(() => {

                let spy = spyOn(component.buildingComponent, "loadData");
                let mockRoute: ActivatedRoute = target.debugElement.injector.get(ActivatedRoute);
                let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
                let spyGetDataset = spyOn(mockDataSetFactory, "get").and.returnValue(Promise.resolve(new DataSet({ team_id: "team_id" })));

                let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
                let spyGetTeam = spyOn(mockTeamFactory, "get").and.returnValue(Promise.resolve(new Team({ team_id: "team_id", name: "Winners" })))

                component.ngOnInit();

                mockRoute.params.toPromise().then((params: Params) => {
                    expect(spy).toHaveBeenCalledWith(123, "slug");
                    expect(spyGetDataset).toHaveBeenCalled();
                    spyGetDataset.calls.mostRecent().returnValue.then(() => {
                        expect(spyGetDataset).toHaveBeenCalledWith(123);

                        expect(spyGetTeam).toHaveBeenCalledWith("team_id");
                        component.team.then((r) => {
                            expect(r).toEqual(new Team({ team_id: "team_id", name: "Winners" }))
                        })
                    })
                });

            }));

            it("loads members from team", async(() => {

                let spy = spyOn(component.buildingComponent, "loadData");
                let mockRoute: ActivatedRoute = target.debugElement.injector.get(ActivatedRoute);
                let mockDataSetFactory = target.debugElement.injector.get(DatasetFactory);
                let spyGetDataset = spyOn(mockDataSetFactory, "get").and.returnValue(Promise.resolve(new DataSet({ team_id: "team_id" })));

                let mockTeamFactory = target.debugElement.injector.get(TeamFactory);
                let spyGetTeam = spyOn(mockTeamFactory, "get").and.returnValue(Promise.resolve(new Team({ members: [new User({ user_id: "1" })] })));

                component.ngOnInit();

                mockRoute.params.toPromise().then((params: Params) => {
                    expect(spy).toHaveBeenCalledWith(123, "slug");
                    expect(spyGetDataset).toHaveBeenCalled();
                    spyGetDataset.calls.mostRecent().returnValue.then(() => {
                        expect(spyGetDataset).toHaveBeenCalledWith(123);

                        expect(spyGetTeam).toHaveBeenCalledWith("team_id");

                        component.members.then((r) => {
                            expect(r).toEqual([new User({ user_id: "1" })])
                        })
                    })
                });

            }));
        });

    });











});
