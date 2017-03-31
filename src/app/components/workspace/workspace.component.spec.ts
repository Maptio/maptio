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
import { ErrorService } from "../../shared/services/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

describe("workspace.component.ts", () => {

    let component: WorkspaceComponent;
    let target: ComponentFixture<WorkspaceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WorkspaceComponent, BuildingComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(WorkspaceComponent, {
            set: {
                providers: [DataService, DatasetFactory, UserFactory,
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
                            params: Observable.of({ id: 123 })
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
                    expect(spy).toHaveBeenCalledWith(123);
                });
            }));
        });

    });











});
