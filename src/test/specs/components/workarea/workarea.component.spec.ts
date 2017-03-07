import { Router } from '@angular/router';
import { UserFactory } from './../../../../app/shared/services/user.factory';
import { ComponentFixture, TestBed, async, fakeAsync } from "@angular/core/testing";
import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core"
import { By } from "@angular/platform-browser";
import { AppComponent } from "../../../../app/app.component";
import { HelpComponent } from "../../../../app/components/help/help.component"
import { BuildingComponent } from "../../../../app/components/building/building.component"
import { DatasetFactory } from "../../../../app/shared/services/dataset.factory";
import { DataService } from "../../../../app/shared/services/data.service";
import { DataSet } from "../../../../app/shared/model/dataset.data";
import { ErrorService } from "../../../../app/shared/services/error.service";
import { Auth } from "../../../../app/shared/services/auth.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { User } from "../../../../app/shared/model/user.data";
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

export class AuthStub {
    fakeProfile: User = new User({ name: "John Doe", email: "johndoe@domain.com", picture: "http://seemyface.com/user.jpg", user_id: "someId" });

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

xdescribe("app.component.ts", () => {

    let component: AppComponent;
    let target: ComponentFixture<AppComponent>;
    let de: DebugElement;
    let el: HTMLElement;
    let DATASETS = [new DataSet({ name: "One", id: "one" }), new DataSet({ name: "Two", id: "two" }), new DataSet({ name: "Three", id: "three" })];
    let spyDataSetService: jasmine.Spy;
    let spyAuthService: jasmine.Spy;
    let mockAuth: Auth;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent, HelpComponent, BuildingComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(AppComponent, {
            set: {
                providers: [
                    DatasetFactory, DataService, UserFactory, Router,
                    { provide: Auth, useClass: AuthStub },
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                            return new Http(mockBackend, options);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    MockBackend,
                    BaseRequestOptions,
                    ErrorService]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(AppComponent);

        component = target.componentInstance;

        let mockDataSetService = target.debugElement.injector.get(DatasetFactory);
        spyDataSetService = spyOn(mockDataSetService, "get").and.callFake(function (parameters: any) {
            if (parameters instanceof User) {
                return Promise.resolve(DATASETS);
            }
            if (typeof parameters === "string") {
                return Promise.resolve(new DataSet({ id: parameters.toString(), name: "a dataset" }));
            }
        });

        mockAuth = target.debugElement.injector.get(Auth);

        // target.detectChanges(); // trigger initial data binding
    });

    describe("View", () => {

        describe("Help button", () => {
            it("should call openHelp", () => {
                let spy = spyOn(component, "openHelp");
                let helpClickElement = target.debugElement.query(By.css("#openHelpWindow"));
                (helpClickElement.nativeElement as HTMLAnchorElement).click();
                expect(spy).toHaveBeenCalled();
            });
        });

        xdescribe("Work area panel", () => {
            it("should show when user is authenticated", () => {
                spyOn(mockAuth, "authenticated").and.returnValue(true);
                target.detectChanges();
                let panel = target.debugElement.queryAll(By.css("#workAreaPanel"));
                expect(panel.length).toBe(1);
            });

            it("should hide when user is not authenticated", () => {
                spyOn(mockAuth, "authenticated").and.returnValue(false);
                target.detectChanges();
                let panel = target.debugElement.queryAll(By.css("#workAreaPanel"));
                expect(panel.length).toBe(0);
            });
        })

        xdescribe("Map your initiative panel", () => {

            // it("should call toggle building panel when user is authenticated", () => {
            //     spyOn(mockAuth, "authenticated").and.returnValue(true);

            //     target.detectChanges();
            //     let togglingElement = target.debugElement.query(By.css("h4.panel-title>a"));
            //     let spy = spyOn(component, "toggleBuildingPanel").and.callThrough();

            //     let toggledElement = target.debugElement.query(By.css("h4.panel-title>a i"));
            //     expect((toggledElement.nativeElement as HTMLElement).className).toContain("fa-plus-square");

            //     togglingElement.triggerEventHandler("click", null);
            //     target.detectChanges();

            //     toggledElement = target.debugElement.query(By.css("h4.panel-title>a i"));
            //     expect((toggledElement.nativeElement as HTMLElement).className).toContain("fa-minus-square");

            //     togglingElement.triggerEventHandler("click", null);
            //     target.detectChanges();

            //     toggledElement = target.debugElement.query(By.css("h4.panel-title>a i"));
            //     expect((toggledElement.nativeElement as HTMLElement).className).toContain("fa-plus-square");

            //     expect(spy).toHaveBeenCalledTimes(2);
            // });
        })
    });

    describe("Controller", () => {
        it("should open Help modal in openHelp", () => {
            let spy = spyOn(component.helpComponent, "open");
            component.openHelp();
            expect(spy).toHaveBeenCalled();
        });


        it("should display /work in openDataset", () => {

        });

        // xit("should change value of isBuildingPanelCollapsed when calling toggleBuildingPanel", () => {
        //     expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();
        //     component.toggleBuildingPanel();
        //     expect(target.componentInstance.isBuildingPanelCollapsed).toBeFalsy();
        //     component.toggleBuildingPanel();
        //     expect(target.componentInstance.isBuildingPanelCollapsed).toBeTruthy();

        // });
    });











});
