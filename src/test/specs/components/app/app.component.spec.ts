import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from "@angular/core/testing";
import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core"
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { AppComponent } from "../../../../app/app.component";
import { HelpComponent } from "../../../../app/components/help/help.component"
import { BuildingComponent } from "../../../../app/components/building/building.component"
import { DatasetFactory } from "../../../../app/shared/services/dataset.factory";
import { DataService } from "../../../../app/shared/services/data.service";
import { DataSet } from "../../../../app/shared/model/dataset.data";
import { ErrorService } from "../../../../app/shared/services/error.service";
import { Auth } from "../../../../app/shared/services/auth.service";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { Http, HttpModule, Response, Headers, RequestOptions, BaseRequestOptions, ResponseOptions } from "@angular/http";
import { AuthenticatedUser } from "../../../../app/shared/model/user.data";
import { Observable } from "rxjs/Rx";

import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";

export class AuthStub {
    fakeProfile: Object = { name: "John Doe", email: "johndoe@domain.com", picture: "http://seemyface.com/user.jpg" };

    public getUser(): Observable<Object> {
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

describe("app.component.ts", () => {

    let component: AppComponent;
    let target: ComponentFixture<AppComponent>;
    let de: DebugElement;
    let el: HTMLElement;
    let DATASETS = [new DataSet({ name: "One", url: "one.json" }), new DataSet({ name: "Two", url: "two.json" }), new DataSet({ name: "Three", url: "three.json" })];
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
                    DatasetFactory, DataService,
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
        spyDataSetService = spyOn(mockDataSetService, "get").and.returnValue(Promise.resolve(DATASETS));

        mockAuth = target.debugElement.injector.get(Auth);

        //target.detectChanges(); // trigger initial data binding
    });

    describe("View", () => {

        describe("New project button", () => {
            it("should call start() when clicked", () => {
                spyOn(mockAuth, "authenticated").and.returnValue(true);
                target.detectChanges();
                let startElement = target.debugElement.query(By.css("#loadNewProjectButton"));
                let spy = spyOn(component, "start");

                startElement.triggerEventHandler("click", null);
                expect(spy).toHaveBeenCalledWith(DataSet.EMPTY);
            });

            it("should not display if user is not authenticated", () => {
                spyOn(mockAuth, "authenticated").and.returnValue(false);
                target.detectChanges();
                let startElement = target.debugElement.queryAll(By.css("#loadNewProjectButton"));
                expect(startElement.length).toBe(0);
            });
        });

        describe("List of datasets", () => {
            it("should show a list of datasets when user is valid", fakeAsync(() => {

                let mockUser = jasmine.createSpyObj("mockUser", ["tryDeserialize"]);
                mockUser.tryDeserialize.and.returnValue([true, new AuthenticatedUser({ name: "Parsed user" })]);
                let spyCreateUser = spyOn(AuthenticatedUser, "create").and.returnValue(mockUser);

                spyAuthService = spyOn(mockAuth, "getUser").and.callThrough();
                spyOn(mockAuth, "authenticated").and.returnValue(true);

                component.ngOnInit();

                expect(spyAuthService.calls.any()).toEqual(true);
                spyAuthService.calls.mostRecent().returnValue.toPromise().then(() => {

                    expect(spyCreateUser).toHaveBeenCalled();
                    expect(mockUser.tryDeserialize).toHaveBeenCalled();

                    expect(spyDataSetService).toHaveBeenCalled();
                    expect(spyDataSetService).toHaveBeenCalledWith(jasmine.any(AuthenticatedUser));
                    expect(spyDataSetService).toHaveBeenCalledWith(jasmine.objectContaining({
                        name: "Parsed user"
                    }));
                    spyDataSetService.calls.mostRecent().returnValue.then(() => {
                        target.detectChanges(); // update view with quote
                        let elements = target.debugElement.queryAll(By.css("ul#loadDatasetDropdown > li :not(.dropdown-header)"));
                        expect(elements.length).toBe(3);
                        expect(elements[0].nativeElement.textContent).toBe("One");
                        expect(elements[1].nativeElement.textContent).toBe("Two");
                        expect(elements[2].nativeElement.textContent).toBe("Three");
                    });
                })
            }));



            it("should not show a list of datasets when user is invalid", fakeAsync(() => {
                let mockUser = jasmine.createSpyObj("mockUser", ["tryDeserialize"]);
                mockUser.tryDeserialize.and.returnValue([false, undefined]);
                let spyCreateUser = spyOn(AuthenticatedUser, "create").and.returnValue(mockUser);

                spyAuthService = spyOn(mockAuth, "getUser").and.callThrough();

                component.ngOnInit();

                expect(spyAuthService.calls.any()).toEqual(true);
                spyAuthService.calls.mostRecent().returnValue.toPromise().then(() => {

                    expect(spyCreateUser).toHaveBeenCalled();
                    expect(mockUser.tryDeserialize).toHaveBeenCalled();

                    expect(spyDataSetService).not.toHaveBeenCalled();
                })
            }));
        });

        describe("Help button", () => {
            it("should call openHelp", () => {
                let spy = spyOn(component, "openHelp");
                let helpClickElement = target.debugElement.query(By.css("#openHelpWindow"));
                (helpClickElement.nativeElement as HTMLAnchorElement).click();
                expect(spy).toHaveBeenCalled();
            });
        });

        describe("Work area panel", () => {
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

        describe("Map your initiative panel", () => {

            it("should call toggle building panel when user is authenticated", () => {
                spyOn(mockAuth, "authenticated").and.returnValue(true);

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

        describe("Project name", () => {
            it("should display dataset name in navigation bar after it is loaded", async(() => {
                spyOn(mockAuth, "authenticated").and.returnValue(true);
                target.detectChanges();
                let dataset = new DataSet({ name: "Example", url: "http://server/example.json" });
                component.start(dataset);
                target.whenStable().then(() => {
                    target.detectChanges();
                    let element = target.debugElement.query(By.css("#datasetName"));
                    expect(element).toBeDefined();
                    expect(element.nativeElement.textContent).toContain(dataset.name);
                });

            }));
        });

        describe("Authentication", () => {
            it("should display LogIn button when no user is authenticated", () => {

                let spyAuthService = spyOn(mockAuth, "authenticated").and.returnValue(false);

                target.detectChanges();

                let imgElement = target.debugElement.queryAll(By.css("li#profileInformation img"));
                expect(imgElement.length).toBe(0);
                let profileNameElement = target.debugElement.queryAll(By.css("li#profileInformation strong"));
                expect(profileNameElement.length).toBe(1);
                expect(profileNameElement[0].nativeElement.textContent).toBe("John Doe");
                let button = target.debugElement.queryAll(By.css("li#loginButton a"));
                expect(button.length).toBe(1);
                expect(button[0].nativeElement.textContent).toBe("Log In");
                expect(spyAuthService).toHaveBeenCalled();
            });

            it("should display LogOut button and profile information when a user is authenticated", () => {
                let spyAuthService = spyOn(mockAuth, "authenticated").and.returnValue(true);

                target.detectChanges();

                let imgElement = target.debugElement.query(By.css("li#profileInformation img")).nativeElement as HTMLImageElement;
                expect(imgElement.src).toBe("http://seemyface.com/user.jpg");

                let profileNameElement = target.debugElement.query(By.css("li#profileInformation strong")).nativeElement as HTMLElement;
                expect(profileNameElement.innerHTML).toBe("John Doe");

                let button = target.debugElement.queryAll(By.css("li#loginButton a"));
                expect(button.length).toBe(1);
                expect(button[0].nativeElement.textContent).toBe("Log Out");
                expect(spyAuthService).toHaveBeenCalled();
            });

            it("should call authenticate.login()  when LogIn button is clicked", () => {
                let spyAuthService = spyOn(mockAuth, "authenticated").and.returnValue(false);
                let spyLogIn = spyOn(mockAuth, "login");

                target.detectChanges();
                let button = target.debugElement.query(By.css("li#loginButton a")).nativeElement as HTMLAnchorElement;
                button.dispatchEvent(new Event("click"));
                target.detectChanges();

                expect(spyLogIn).toHaveBeenCalled();
                expect(spyAuthService).toHaveBeenCalled();
            })

            it("should call authenticate.logout()  when LogOut button is clicked", () => {
                let spyAuthService = spyOn(mockAuth, "authenticated").and.returnValue(true);
                let spyLogOut = spyOn(mockAuth, "logout");

                target.detectChanges();
                let button = target.debugElement.query(By.css("li#loginButton a")).nativeElement as HTMLAnchorElement;
                button.dispatchEvent(new Event("click"));
                target.detectChanges();

                expect(spyLogOut).toHaveBeenCalled();
                expect(spyAuthService).toHaveBeenCalled();
            })
        });

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

        it("should load data in building component", () => {
            spyOn(mockAuth, "authenticated").and.returnValue(true);
            target.detectChanges();
            let spy = spyOn(component.buildingComponent, "loadData");
            let dataset = new DataSet({ name: "Example", url: "http://server/example.json" });
            component.start(dataset);
            expect(spy).toHaveBeenCalledWith("http://server/example.json");
        });
    });











});
