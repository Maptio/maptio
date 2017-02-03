import { ComponentFixture, TestBed, async, fakeAsync } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core'
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { AppComponent } from '../../../../app/app.component';
import { HelpComponent } from '../../../../app/components/help/help.component'
import { DataSetService } from '../../../../app/services/dataset.service';
import { DataSet } from '../../../../app/model/dataset.data';
import { ErrorService } from '../../../../app/services/error.service';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Http, HttpModule, Response, Headers, RequestOptions, BaseRequestOptions, ResponseOptions } from '@angular/http';

describe('app.component.ts', () => {

    let component: AppComponent;
    let target: ComponentFixture<AppComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DataSetService,
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
            declarations: [AppComponent, HelpComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(AppComponent);
        component = target.componentInstance;

        target.detectChanges(); // trigger initial data binding
    });

    describe('View', () => {
        it("should call start() when click on 'New Project' button ", () => {
            let startElement = target.debugElement.query(By.css('#loadNewProjectButton'));
            let spy = spyOn(AppComponent.prototype, "start");

            startElement.triggerEventHandler('click', null);
            expect(spy).toHaveBeenCalledWith(DataSet.EMPTY);
        });

        it("should call start() when a dataset is selected", fakeAsync(() => {
            // let datasets = [new DataSet("One", "one.json"), new DataSet("Two", "two.json"), new DataSet("Three", "three.json")];
            // target.whenStable().then
            // target.detectChanges();

            // let elements = target.debugElement.queryAll(By.css('ul#loadDatasetDropdown>li'));
            // expect(elements.length).toBe(3);

            // let spy = spyOn(AppComponent.prototype, "start");
            // (startElement.nativeElement as HTMLSelectElement).selectedIndex = 1;

            // target.detectChanges();
            // expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ name: "Two" }))
        }));

    });

    describe('Controller', () => {
        it("should display page with the building panel closed at first", () => {
            expect(component.isBuildingPanelCollapsed).toBeTruthy();
        });

    });


    it("should open Help modal on click", () => {
        spyOn(target.componentInstance.helpComponent, "open");
        let helpClickElement = target.debugElement.query(By.css('#openHelpWindow'));
        (helpClickElement.nativeElement as HTMLAnchorElement).click();
        expect(target.componentInstance.helpComponent).toBeDefined();
        expect(target.componentInstance.helpComponent.open).toHaveBeenCalled();
    });


    it("should toggle Building panel on click", () => {
        let togglingElement = target.debugElement.query(By.css('h4.panel-title>a'));

        expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();
        togglingElement.triggerEventHandler('click', null);
        expect(target.componentInstance.isBuildingPanelCollapsed).toBeFalsy();

        togglingElement = target.debugElement.query(By.css('h4.panel-title>a')); //re query the element to get current status
        togglingElement.triggerEventHandler('click', null);
        expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();
    });






});
