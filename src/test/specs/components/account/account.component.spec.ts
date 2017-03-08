import { Observable } from "rxjs/Rx";
import { User } from "./../../../../app/shared/model/user.data";
import { DatasetFactory } from "./../../../../app/shared/services/dataset.factory";
import { ErrorService } from "./../../../../app/shared/services/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { UserFactory } from "./../../../../app/shared/services/user.factory";
import { Auth } from "./../../../../app/shared/services/auth.service";
import { AccountComponent } from "./../../../../app/components/account/account.component";
import { DataSet } from "./../../../../app/shared/model/dataset.data";
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
    let DATASETS = [new DataSet({ name: "One", id: "one" }), new DataSet({ name: "Two", id: "two" }), new DataSet({ name: "Three", id: "three" })];

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
                        return Promise.resolve(new DataSet({ id: parameters.toString(), name: "a dataset" }));
                    }
                });
                component.ngOnInit();
                spyAuth.calls.mostRecent().returnValue.toPromise().then((user: User) => {
                    // FIXME : check the i/o of this spy but how ?
                    expect(spyFactory).toHaveBeenCalled();
                });

            }))
        });

        describe("delete", () => {
            it("should call factory for deletion and display succesful message when it succeeds", async(() => {
                let error = target.debugElement.injector.get(ErrorService);
                let spyError = spyOn(error, "handleError");
                let factory = target.debugElement.injector.get(DatasetFactory);
                let spy = spyOn(factory, "delete").and.returnValue(Promise.resolve<boolean>(true));

                let dataset = new DataSet({ id: "unique_id", name: "Some data" });
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

                let dataset = new DataSet({ id: "unique_id", name: "Some data" });
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

                let dataset = new DataSet({ id: "unique_id", name: "Some data" });
                component.open(dataset)
                expect(router.navigate).toHaveBeenCalledWith(["workspace", "unique_id"]);

            });
        });
    });




});
