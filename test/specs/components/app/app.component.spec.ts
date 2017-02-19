import { ComponentFixture, TestBed, async, fakeAsync, tick, inject } from "@angular/core/testing";
import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core"
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { AppComponent } from "../../../../app/app.component";
import { HelpComponent } from "../../../../app/components/help/help.component"
import { BuildingComponent } from "../../../../app/components/building/building.component"
import { DataSetService } from "../../../../app/shared/services/dataset.service";
import { DataService } from "../../../../app/shared/services/data.service";
import { DataSet } from "../../../../app/shared/model/dataset.data";
import { ErrorService } from "../../../../app/shared/services/error.service";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { Http, HttpModule, Response, Headers, RequestOptions, BaseRequestOptions, ResponseOptions } from "@angular/http";

describe("app.component.ts", () => {

    let component: AppComponent;
    let target: ComponentFixture<AppComponent>;
    let de: DebugElement;
    let el: HTMLElement;
    let DATASETS = [new DataSet("One", "one.json"), new DataSet("Two", "two.json"), new DataSet("Three", "three.json")];
    let spyDataSetService: jasmine.Spy;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DataSetService, DataService,
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService],
            declarations: [AppComponent, HelpComponent, BuildingComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(AppComponent);
        component = target.componentInstance;

        let mockDataSetService = target.debugElement.injector.get(DataSetService);
        spyDataSetService = spyOn(mockDataSetService, "getData").and.returnValue(Promise.resolve(DATASETS));


        target.detectChanges(); // trigger initial data binding
    });

    describe("View", () => {
        it("should call start() when click on 'New Project' button ", () => {
            let startElement = target.debugElement.query(By.css("#loadNewProjectButton"));
            let spy = spyOn(component, "start");

            startElement.triggerEventHandler("click", null);
            expect(spy).toHaveBeenCalledWith(DataSet.EMPTY);
        });

        it("should show a list of datasets (async)", async(() => {
            target.detectChanges();
            target.whenStable().then(() => {
                target.detectChanges();
                let elements = target.debugElement.queryAll(By.css("ul#loadDatasetDropdown > li :not(.dropdown-header)"));
                expect(elements.length).toBe(3);
                expect(elements[0].nativeElement.textContent).toBe("One");
                expect(elements[1].nativeElement.textContent).toBe("Two");
                expect(elements[2].nativeElement.textContent).toBe("Three");
                expect(spyDataSetService).toHaveBeenCalled();
            });
        }));

        it("should call openHelp", () => {
            let spy = spyOn(component, "openHelp");
            let helpClickElement = target.debugElement.query(By.css("#openHelpWindow"));
            (helpClickElement.nativeElement as HTMLAnchorElement).click();
            expect(spy).toHaveBeenCalled();
        });

        it("should call toggle building panel", () => {
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

        it("should display dataset name in navigation bar after it is loaded", async(() => {
            let dataset = new DataSet("Example", "http://server/example.json");
            component.start(dataset);
            target.detectChanges();
            target.whenStable().then(() => {

                let element = target.debugElement.query(By.css("#datasetName"));
                expect(element).toBeDefined();
                expect(element.nativeElement.textContent).toContain(dataset.name);
            })

        }));


    });

    describe("Controller", () => {
        it("should display page with the building panel closed at first", () => {
            expect(component.isBuildingPanelCollapsed).toBeTruthy();
        });

        it("should open Help modal in openHelp", () => {
            let spy = spyOn(component.helpComponent, "open");
            component.openHelp();
            expect(spy).toHaveBeenCalled();
        });

        it("should change value of isBuildingPanelCollapsed when calling toggleBuildingPanel", () => {
            expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();
            component.toggleBuildingPanel();
            expect(target.componentInstance.isBuildingPanelCollapsed).toBeFalsy();
            component.toggleBuildingPanel();
            expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();

        });

        it("should load data in building component", async () => {
            let spy = spyOn(component.buildingComponent, "loadData");
            let dataset = new DataSet("Example", "http://server/example.json");
            component.start(dataset);
            target.detectChanges();
            target.whenStable().then(() => {
                expect(spy).toHaveBeenCalledWith("http://server/example.json");
            });
        });
    });











});
