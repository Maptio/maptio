import { Observable } from "rxjs/Rx";
import { User } from "./../../shared/model/user.data";
import { DatasetFactory } from "./../../shared/services/dataset.factory";
import { ErrorService } from "./../../shared/services/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { UserFactory } from "./../../shared/services/user.factory";
import { Auth } from "./../../shared/services/auth.service";
import { AccountComponent } from "./account.component";
import { DataSet } from "./../../shared/model/dataset.data";
import { Router } from "@angular/router";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core"
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

describe("account.component.ts", () => {

    let component: AccountComponent;
    let target: ComponentFixture<AccountComponent>;
    let DATASETS = [new DataSet({ name: "One", _id: "one" }), new DataSet({ name: "Two", _id: "two" }), new DataSet({ name: "Three", _id: "three" })];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AccountComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(AccountComponent, {
            set: {
                providers: [
                    { provide: Auth, useClass: AuthStub },
                    { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                    UserFactory, ErrorService, DatasetFactory,
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                            return new Http(mockBackend, options);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    MockBackend,
                    BaseRequestOptions]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(AccountComponent);

        component = target.componentInstance;

        target.detectChanges();
    });

    describe("Controller", () => {

        describe("ngOnInit", () => {
            it("should retrieve user and matching datasets", async(() => {
                let mockAuth: Auth = target.debugElement.injector.get(Auth);
                let spyAuth = spyOn(mockAuth, "getUser").and.callThrough();

                let mockDatasetFactory: DatasetFactory = target.debugElement.injector.get(DatasetFactory);
                let spyFactory = spyOn(mockDatasetFactory, "get").and.callFake(function (parameters: any) {
                    if (parameters instanceof User) {
                        return Promise.resolve(DATASETS);
                    }
                    if (typeof parameters === "string") {
                        return Promise.resolve(new DataSet({ _id: parameters.toString(), name: "a dataset" }));
                    }
                });
                component.ngOnInit();
                spyAuth.calls.mostRecent().returnValue.toPromise().then((user: User) => {
                    expect(spyFactory).toHaveBeenCalled();
                });

            }));

            it("should call error service if authentication doesnt return user", async(() => {
                let errorMsg = "Authentication failed";
                let mockAuth: Auth = target.debugElement.injector.get(Auth);
                let mockError: ErrorService = target.debugElement.injector.get(ErrorService);
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

        describe("delete", () => {
            it("should call factory for deletion and display succesful message when it succeeds", async(() => {
                let error = target.debugElement.injector.get(ErrorService);
                let spyError = spyOn(error, "handleError");
                let factory = target.debugElement.injector.get(DatasetFactory);
                let spy = spyOn(factory, "delete").and.returnValue(Promise.resolve<boolean>(true));

                let dataset = new DataSet({ _id: "unique_id", name: "Some data" });
                component.delete(dataset)
                spy.calls.mostRecent().returnValue.then(() => {
                    expect(spy).toHaveBeenCalledWith(dataset, jasmine.objectContaining({ user_id: "someId" }));
                    expect(spyError).not.toHaveBeenCalled();
                });

            }));

            it("should call factory for deletion and calls errorservice when it fails", async(() => {
                let factory = target.debugElement.injector.get(DatasetFactory);
                let error = target.debugElement.injector.get(ErrorService);
                let spyError = spyOn(error, "handleError");
                let spy = spyOn(factory, "delete").and.returnValue(Promise.resolve<boolean>(false));

                let dataset = new DataSet({ _id: "unique_id", name: "Some data" });
                component.delete(dataset);

                spy.calls.mostRecent().returnValue.then(() => {
                    expect(spy).toHaveBeenCalledWith(dataset, jasmine.objectContaining({ user_id: "someId" }));
                    expect(spyError).toHaveBeenCalled();
                });

            }));
        });

        describe("open", () => {
            it("should navigate to workspace with dataset ID", () => {
                let router = target.debugElement.injector.get(Router);

                let dataset = new DataSet({ _id: "unique_id", name: "Some data" });
                component.open(dataset)
                expect(router.navigate).toHaveBeenCalledWith(["workspace", "unique_id"]);

            });
        });
    });




});
