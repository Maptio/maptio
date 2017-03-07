import { UserFactory } from './../../../../app/shared/services/user.factory';
import { HeaderComponent } from "./../../../../app/components/header/header.component";
import { ComponentFixture, TestBed, async, fakeAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DatasetFactory } from "../../../../app/shared/services/dataset.factory";
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

describe("header.component.ts", () => {

    let component: HeaderComponent;
    let target: ComponentFixture<HeaderComponent>;
    let DATASETS = [new DataSet({ name: "One", id: "one" }), new DataSet({ name: "Two", id: "two" }), new DataSet({ name: "Three", id: "three" })];
    let spyDataSetService: jasmine.Spy;
    let spyAuthService: jasmine.Spy;
    let mockAuth: Auth;

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
                    MockBackend,
                    BaseRequestOptions,
                    ErrorService]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(HeaderComponent);

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
    });

    describe("View", () => {

        describe("New project button", () => {
            it("should call openDataset() when clicked", () => {
                spyOn(mockAuth, "authenticated").and.returnValue(true);
                target.detectChanges();
                let startElement = target.debugElement.query(By.css("#loadNewProjectButton"));
                let spy = spyOn(component, "openDataset");

                startElement.triggerEventHandler("click", null);
                expect(spy).toHaveBeenCalledWith(undefined);
            });

            it("should not display if user is not authenticated", () => {
                spyOn(mockAuth, "authenticated").and.returnValue(false);
                target.detectChanges();
                let startElement = target.debugElement.queryAll(By.css("#loadNewProjectButton"));
                expect(startElement.length).toBe(0);
            });
        });

        describe("List of datasets", () => {
            it("should show a list of datasets when user is valid", async(() => {
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
                spyOn(mockAuth, "authenticated").and.returnValue(true);
                target.detectChanges();
                let dataset = new DataSet({ name: "Example", url: "http://server/example.json" });
                component.openDataset(dataset);
                target.whenStable().then(() => {
                    target.detectChanges();
                    let element = target.debugElement.query(By.css("p#datasetName"));
                    expect(element).toBeDefined();
                    expect(element.nativeElement.textContent).toContain(dataset.name);
                });

            }));
        });

        describe("Authentication", () => {
            it("should display LogIn button when no user is authenticated", () => {
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
                let spyAuthService = spyOn(mockAuth, "authenticated").and.returnValue(true);

                target.detectChanges();

                let imgElement = target.debugElement.query(By.css("li#profileInformation a img")).nativeElement as HTMLImageElement;
                expect(imgElement.src).toBe("http://seemyface.com/user.jpg");

                let profileNameElement = target.debugElement.query(By.css("li#profileInformation a strong")).nativeElement as HTMLElement;
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
        describe("openHelp", () => {
            it("should emit openHelp event ", () => {
                let spy = spyOn(component.openHelpEvent, "emit");
                component.openHelp();
                expect(spy).toHaveBeenCalled();
            });
        })

        describe("openDataSet", () => {
            it("should emit openDatasetEvent", () => {
                let spy = spyOn(component.openDatasetEvent, "emit");
                let dataset = new DataSet({ name: "Example", id: "someId" });
                component.openDataset(dataset);
                expect(spy).toHaveBeenCalledWith(dataset);
            });
        });
    });











});
