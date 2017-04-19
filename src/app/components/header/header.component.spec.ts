import { Router } from "@angular/router";
import { EmitterService } from "./../../shared/services/emitter.service";
import { UserFactory } from "./../../shared/services/user.factory";
import { HeaderComponent } from "./header.component";
import { ComponentFixture, TestBed, async, fakeAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DatasetFactory } from "../../shared/services/dataset.factory";
import { DataSet } from "../../shared/model/dataset.data";
import { ErrorService } from "../../shared/services/error.service";
import { Auth } from "../../shared/services/auth.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { User } from "../../shared/model/user.data";
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

describe("header.component.ts", () => {

    let component: HeaderComponent;
    let target: ComponentFixture<HeaderComponent>;
    let DATASETS = [new DataSet({ name: "One", _id: "one" }), new DataSet({ name: "Two", _id: "two" }), new DataSet({ name: "Three", _id: "three" })];
    let spyDataSetService: jasmine.Spy;
    let spyAuthService: jasmine.Spy;
    //let mockAuth: Auth;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HeaderComponent]
        }).overrideComponent(HeaderComponent, {
            set: {
                providers: [
                    DatasetFactory, UserFactory,
                    { provide: Auth, useClass: AuthStub },
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                            return new Http(mockBackend, options);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                    MockBackend,
                    BaseRequestOptions,
                    ErrorService]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(HeaderComponent);

        component = target.componentInstance;





    });

    describe("View", () => {

        describe("New project button", () => {
            it("should call createDataset() when clicked", () => {
                let mockAuth = target.debugElement.injector.get(Auth);
                spyOn(mockAuth, "authenticated").and.returnValue(true);
                target.detectChanges();
                let startElement = target.debugElement.query(By.css("#loadNewProjectButton"));
                let spy = spyOn(component, "createDataset");

                startElement.triggerEventHandler("click", null);
                expect(spy).toHaveBeenCalled();
            });

            it("should not display if user is not authenticated", () => {
                let mockAuth = target.debugElement.injector.get(Auth);
                spyOn(mockAuth, "authenticated").and.returnValue(false);
                target.detectChanges();
                let startElement = target.debugElement.queryAll(By.css("#loadNewProjectButton"));
                expect(startElement.length).toBe(0);
            });
        });

        describe("List of datasets", () => {
            it("should show a list of datasets when user is valid", async(() => {
                let mockAuth = target.debugElement.injector.get(Auth);

                let mockDataSetService = target.debugElement.injector.get(DatasetFactory);
                spyDataSetService = spyOn(mockDataSetService, "get").and.callFake(function (parameters: any) {
                    if (parameters instanceof User) {
                        return Promise.resolve(DATASETS);
                    }
                    if (typeof parameters === "string") {
                        return Promise.resolve(new DataSet({ _id: parameters.toString(), name: "a dataset" }));
                    }
                });
                // FIXME : should be part of a protractor tests suite
                spyAuthService = spyOn(mockAuth, "getUser").and.callThrough();
                spyOn(mockAuth, "authenticated").and.returnValue(true);

                target.detectChanges();
                target.whenStable().then(() => {
                    expect(spyAuthService.calls.any()).toEqual(true);

                    expect(spyDataSetService).toHaveBeenCalledWith(jasmine.any(User));
                    expect(spyDataSetService).toHaveBeenCalledWith(jasmine.objectContaining({ name: "John Doe" }));
                    expect(spyDataSetService).toHaveBeenCalledTimes(4);

                    // target.detectChanges();
                    // console.log(target.debugElement.query(By.css("ul#loadDatasetDropdown")).nativeElement);
                    // let elements = target.debugElement.queryAll(By.css("ul#loadDatasetDropdown > li :not(.dropdown-header)"));
                    // expect(elements.length).toBe(3);
                    // expect(elements[0].nativeElement.textContent).toBe("One");
                    // expect(elements[1].nativeElement.textContent).toBe("Two");
                    // expect(elements[2].nativeElement.textContent).toBe("Three");
                });

            }));

            xit("should not show a list of datasets when user is invalid", fakeAsync(() => {
                let mockAuth = target.debugElement.injector.get(Auth);
                spyAuthService = spyOn(mockAuth, "getUser").and.callThrough();
                component.ngOnInit();

                expect(spyAuthService.calls.any()).toEqual(true);
                spyAuthService.calls.mostRecent().returnValue.toPromise().then(() => {
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

        describe("Project name", () => {

            it("should display dataset name in navigation bar after it is loaded", async(() => {
                let mockAuth = target.debugElement.injector.get(Auth);
                spyOn(mockAuth, "authenticated").and.returnValue(true);
                target.detectChanges();

                let dataset = new DataSet({ name: "Example", url: "http://server/example.json" });
                component.openDataset(dataset);
                EmitterService.get("datasetName").emit("Example");
                target.whenStable().then(() => {
                    target.detectChanges();

                    let element = target.debugElement.query(By.css("li#datasetName"));
                    expect(element).toBeDefined();
                    expect(element.nativeElement.textContent).toContain(dataset.name);
                });

            }));
        });

        describe("Authentication", () => {
            it("should display LogIn button when no user is authenticated", () => {
                let mockAuth = target.debugElement.injector.get(Auth);
                let spyAuthService = spyOn(mockAuth, "authenticated").and.returnValue(false);
                target.detectChanges();

                let imgElement = target.debugElement.queryAll(By.css("li#profileInformation"));
                expect(imgElement.length).toBe(0);

                let button = target.debugElement.queryAll(By.css("li#loginButton a"));
                expect(button.length).toBe(1);
                expect(button[0].nativeElement.textContent).toBe("Log In");
                expect(spyAuthService).toHaveBeenCalled();
            });

            it("should display LogOut button and profile information when a user is authenticated", () => {
                let mockAuth = target.debugElement.injector.get(Auth);
                let spyAuthService = spyOn(mockAuth, "authenticated").and.returnValue(true);

                target.detectChanges();

                let imgElement = target.debugElement.query(By.css("li#profileInformation a div img")).nativeElement as HTMLImageElement;
                expect(imgElement.src).toBe("http://seemyface.com/user.jpg");

                let profileNameElement = target.debugElement.query(By.css("li#profileInformation a")).nativeElement as HTMLElement;
                expect(profileNameElement.textContent.trim()).toBe("John Doe");

                let button = target.debugElement.queryAll(By.css("li#logoutButton"));
                expect(button.length).toBe(1);
                expect(button[0].nativeElement.textContent.trim()).toBe("Log Out");
                expect(spyAuthService).toHaveBeenCalled();
            });

            it("should call authenticate.login()  when LogIn button is clicked", () => {
                let mockAuth = target.debugElement.injector.get(Auth);
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
                let mockAuth = target.debugElement.injector.get(Auth);
                let spyAuthService = spyOn(mockAuth, "authenticated").and.returnValue(true);
                let spyLogOut = spyOn(mockAuth, "logout");

                target.detectChanges();
                let button = target.debugElement.query(By.css("li#logoutButton a")).nativeElement as HTMLAnchorElement;
                button.dispatchEvent(new Event("click"));
                target.detectChanges();

                expect(spyLogOut).toHaveBeenCalled();
                expect(spyAuthService).toHaveBeenCalled();
            })
        });

    });

    describe("Controller", () => {

        describe("ngOnInit", () => {
            it("should retrieve user and matching datasets", async(() => {
                let mockAuth: Auth = target.debugElement.injector.get(Auth);
                let spyAuth = spyOn(mockAuth, "getUser").and.callThrough();
                let mockDataSetService = target.debugElement.injector.get(DatasetFactory);
                spyDataSetService = spyOn(mockDataSetService, "get").and.callFake(function (parameters: any) {
                    if (parameters instanceof User) {
                        return Promise.resolve(DATASETS);
                    }
                    if (typeof parameters === "string") {
                        return Promise.resolve(new DataSet({ _id: parameters.toString(), name: "a dataset" }));
                    }
                });

                component.ngOnInit();
                spyAuth.calls.mostRecent().returnValue.toPromise().then((user: User) => {
                    expect(spyDataSetService).toHaveBeenCalled();
                });

            }));

            it("should call error service if authentication doesnt return user", async(() => {

                let errorMsg = "Authentication failed";
                let mockError: ErrorService = target.debugElement.injector.get(ErrorService);
                let mockAuth = target.debugElement.injector.get(Auth);

                let spyAuth = spyOn(mockAuth, "getUser").and.callFake(function () { return Observable.throw(errorMsg) })
                let spyError = spyOn(mockError, "handleError");

                component.ngOnInit();
                expect(spyAuth).toHaveBeenCalledTimes(1);
                expect(spyError).toHaveBeenCalledWith(errorMsg);
            }))


            it("should call error service if datasets retrieval doesnt work", async(() => {
                let errorMsg = "Cant find datasets for this user";
                let mockAuth: Auth = target.debugElement.injector.get(Auth);
                let mockError: ErrorService = target.debugElement.injector.get(ErrorService);
                let mockDatasetFactory: DatasetFactory = target.debugElement.injector.get(DatasetFactory);

                let spyAuth = spyOn(mockAuth, "getUser").and.callThrough();
                let spyDatasets = spyOn(mockDatasetFactory, "get").and.returnValue(Promise.reject<void>(errorMsg))
                let spyError = spyOn(mockError, "handleError");

                component.ngOnInit();
                spyDatasets.calls.mostRecent().returnValue.then(() => { }).catch(() => {
                    expect(spyError).toHaveBeenCalledWith(errorMsg);
                })
                expect(spyAuth).toHaveBeenCalledTimes(1);
                expect(spyDatasets).toHaveBeenCalledTimes(1);
            }));


        });


        describe("openHelp", () => {
            it("should emit openHelp event ", () => {
                let spy = spyOn(component.openHelpEvent, "emit");
                component.openHelp();
                expect(spy).toHaveBeenCalled();
            });
        })

        describe("openDataSet", () => {
            it("should open workspace with dataset id", () => {
                let router = target.debugElement.injector.get(Router)
                let dataset = new DataSet({ name: "Example", _id: "someId" });
                component.openDataset(dataset);
                expect(router.navigate).toHaveBeenCalledWith(["workspace", "someId"]);
            });
        });

        describe("createDataset", () => {
            it("should create a dataset with no name and then attach it to the authenticated user and open it", async(() => {
                let mockFactory = target.debugElement.injector.get(DatasetFactory);
                let spyCreate = spyOn(mockFactory, "create").and.returnValue(Promise.resolve(true));
                let spyAdd = spyOn(mockFactory, "add").and.returnValue(Promise.resolve(true));
                let spyOpen = spyOn(component, "openDataset");

                component.createDataset();
                spyCreate.calls.mostRecent().returnValue.then(() => {
                    expect(spyAdd).toHaveBeenCalled();
                    spyAdd.calls.mostRecent().returnValue.then(() => {
                        expect(spyOpen).toHaveBeenCalled();
                    });
                });
                expect(spyCreate).toHaveBeenCalled();
            }));

            it("should call errorService if creation doesnt work", async(() => {
                let mockFactory = target.debugElement.injector.get(DatasetFactory);
                let error = target.debugElement.injector.get(ErrorService);
                let spyError = spyOn(error, "handleError");
                let spyCreate = spyOn(mockFactory, "create").and.returnValue(Promise.reject("Didnt work"));
                let spyAdd = spyOn(mockFactory, "add")
                let spyOpen = spyOn(component, "openDataset");

                component.createDataset();
                spyCreate.calls.mostRecent().returnValue.then(() => {
                    expect(spyAdd).not.toHaveBeenCalled();
                }).catch(() => {
                    expect(spyError).toHaveBeenCalled();
                });
                expect(spyCreate).toHaveBeenCalled();
                expect(spyOpen).not.toHaveBeenCalled();
            }));

            it("should call errorService if adding dataset doesnt work", async(() => {
                let mockFactory = target.debugElement.injector.get(DatasetFactory);
                let error = target.debugElement.injector.get(ErrorService);
                let spyError = spyOn(error, "handleError");
                let spyCreate = spyOn(mockFactory, "create").and.returnValue(Promise.resolve(true));
                let spyAdd = spyOn(mockFactory, "add").and.returnValue(Promise.reject("Didnt work"));
                let spyOpen = spyOn(component, "openDataset");

                component.createDataset();
                spyCreate.calls.mostRecent().returnValue.then(() => {
                    expect(spyAdd).toHaveBeenCalled();
                    spyAdd.calls.mostRecent().returnValue.then(() => {

                    }).catch(() => { expect(spyError).toHaveBeenCalled(); });
                });
                expect(spyCreate).toHaveBeenCalled();
                expect(spyOpen).not.toHaveBeenCalled();
            }));
        });
    });











});
