import { UIService } from "./../..//shared/services/ui.service";
import { ColorService } from "./../..//shared/services/color.service";
import { D3Service } from "d3-ng2-service";
import { AnchorDirective } from "./../..//shared/directives/anchor.directive";
import { Observable } from "rxjs/Observable";
import { ErrorService } from "./../..//shared/services/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { DataService } from "./../..//shared/services/data.service";
import { MappingTreeComponent } from "./tree/mapping.tree.component";
import { MappingCirclesComponent } from "./circles/mapping.circles.component";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { MappingComponent } from "./mapping.component";
import { Views } from "../../shared/model/view.enum";
import { ComponentFactoryResolver, ComponentFactory, ComponentRef, Type } from "@angular/core";

describe("mapping.component.ts", () => {

    let component: MappingComponent;
    let target: ComponentFixture<MappingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DataService, ErrorService, D3Service, ColorService, UIService,
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions
            ],
            declarations: [MappingComponent, MappingCirclesComponent, MappingTreeComponent, AnchorDirective]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingComponent);
        component = target.componentInstance;

        target.detectChanges(); // trigger initial data binding
    });

    describe("Controller", () => {
        it("should initialize as Circle view per default", () => {
            expect(component.selectedView).toBe(Views.Circles)
        });

        describe("isTreeviewSelected", () => {
            it("should return true when selected view is tree, false otherwise", () => {
                component.selectedView = Views.Circles;
                expect(component.isTreeviewSelected()).toBe(false);
                component.selectedView = Views.Tree;
                expect(component.isTreeviewSelected()).toBe(true);
            })
        })

        describe("isCircleViewSelected", () => {
            it("should return true when selected view is circle, false otherwise", () => {
                component.selectedView = Views.Circles;
                expect(component.isCircleViewSelected()).toBe(true);
                component.selectedView = Views.Tree;
                expect(component.isCircleViewSelected()).toBe(false);
            })
        })

        describe("switchView", () => {
            it("should change Circle to Tree", () => {
                let spy = spyOn(component, "show");
                component.selectedView = Views.Circles;
                component.switchView();
                expect(component.selectedView).toBe(Views.Tree);
                expect(spy).toHaveBeenCalledWith(Views.Tree);
            });

            it("should change Tree to Circles", () => {
                let spy = spyOn(component, "show");
                component.selectedView = Views.Tree;
                component.switchView();
                expect(component.selectedView).toBe(Views.Circles);
                expect(spy).toHaveBeenCalledWith(Views.Circles);
            });

            it("should throw when view selection is not valid", () => {
                component.selectedView = 3;
                expect(function () { component.switchView(); }).toThrowError();
            });
        });


        describe("ngOnInit", () => {
            it("should subscribe to data service and show data with default view", () => {
                let mockDataService = target.debugElement.injector.get(DataService);
                let spyDataService = spyOn(mockDataService, "get").and.returnValue(Observable.of({ name: "some data" }));
                let spyShow = spyOn(component, "show");
                component.ngOnInit();
                expect(spyDataService).toHaveBeenCalled();
                expect(spyShow).toHaveBeenCalledWith(Views.Circles);
            })
        });


        describe("show", () => {
            it("should instanciate MappingCirclesComponent when view is Circles", async(() => {
                let DATA = { content: "DATA" };
                let mockDataService = target.debugElement.injector.get(DataService);
                let spyDataService = spyOn(mockDataService, "get").and.returnValue(Observable.of(DATA));

                let mockResolver = target.debugElement.injector.get(ComponentFactoryResolver);
                let mockFactory = jasmine.createSpyObj<ComponentFactory<MappingCirclesComponent>>("factory", [""]);
                let spyResolver = spyOn(mockResolver, "resolveComponentFactory").and.returnValue(mockFactory);
                let mockComponent = jasmine.createSpyObj<ComponentRef<MappingCirclesComponent>>("component", [""]);
                mockComponent.instance = new MappingCirclesComponent(new D3Service(), null, null);
                let spyDraw = spyOn(mockComponent.instance, "draw");
                let spyCreateComponent = spyOn(component.anchorComponent, "createComponent").and.returnValue(mockComponent);

                component.ngOnInit();
                component.show(Views.Circles);
                spyDataService.calls.mostRecent().returnValue.toPromise().then(() => {
                    expect(spyResolver).toHaveBeenCalled();
                    expect(spyResolver.calls.mostRecent().args[0] instanceof Type).toBeTruthy();
                    expect(spyResolver.calls.mostRecent().args[0].toString()).toContain("MappingCirclesComponent");
                    expect(spyCreateComponent).toHaveBeenCalledWith(mockFactory);
                    expect(spyDraw).toHaveBeenCalledWith(DATA);
                });
            }));

            it("should instanciate MappingTreeComponent when view is Circles", async(() => {
                let DATA = { content: "DATA" };
                let mockDataService = target.debugElement.injector.get(DataService);
                let spyDataService = spyOn(mockDataService, "get").and.returnValue(Observable.of(DATA));

                let mockResolver = target.debugElement.injector.get(ComponentFactoryResolver);
                let mockFactory = jasmine.createSpyObj<ComponentFactory<MappingTreeComponent>>("factory", [""]);
                let spyResolver = spyOn(mockResolver, "resolveComponentFactory").and.returnValue(mockFactory);
                let mockComponent = jasmine.createSpyObj<ComponentRef<MappingTreeComponent>>("component", [""]);
                mockComponent.instance = new MappingTreeComponent(new D3Service(), null, null);
                let spyDraw = spyOn(mockComponent.instance, "draw");
                let spyCreateComponent = spyOn(component.anchorComponent, "createComponent").and.returnValue(mockComponent);

                component.ngOnInit();
                component.show(Views.Tree);
                spyDataService.calls.mostRecent().returnValue.toPromise().then(() => {
                    expect(spyResolver).toHaveBeenCalled();
                    expect(spyResolver.calls.mostRecent().args[0] instanceof Type).toBeTruthy();
                    expect(spyResolver.calls.mostRecent().args[0].toString()).toContain("MappingTreeComponent");
                    expect(spyCreateComponent).toHaveBeenCalledWith(mockFactory);
                    expect(spyDraw).toHaveBeenCalledWith(DATA);
                });
            }));
        });
    });
});