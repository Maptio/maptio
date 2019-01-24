import { environment } from "./../../../environment/environment";
import { CloudinaryModule } from "@cloudinary/angular-5.x";
import * as  Cloudinary from "cloudinary-core";
import { UserFactory } from "./../../shared/services/user.factory";
import { AuthConfiguration } from "./../../shared/services/auth/auth.config";
import { AuthHttp } from "angular2-jwt";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { MailingService } from "./../../shared/services/mailing/mailing.service";
import { JwtEncoder } from "./../../shared/services/encoding/jwt.service";
import { UserService } from "./../../shared/services/user/user.service";
import { ErrorService } from "./../../shared/services/error/error.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Subject } from "rxjs/Rx";
import { AccountComponent } from "./account.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { User } from "../../shared/model/user.data";
import { Auth } from "../../shared/services/auth/auth.service";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { LoaderService } from "../../shared/services/loading/loader.service";
import { NgProgress, NgProgressModule } from "@ngx-progressbar/core";

fdescribe("account.component.ts", () => {

    let component: AccountComponent;
    let target: ComponentFixture<AccountComponent>;
    let user$: Subject<User> = new Subject<User>();

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [AccountComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [NgProgressModule, CloudinaryModule.forRoot(Cloudinary, { cloud_name: environment.CLOUDINARY_CLOUDNAME, upload_preset: environment.CLOUDINARY_UPLOAD_PRESET })]
        }).overrideComponent(AccountComponent, {
            set: {
                providers: [
                    { provide: Auth, useClass: class { getUser() { return user$.asObservable() } } },
                    {
                        provide: AuthHttp,
                        useFactory: authHttpServiceFactoryTesting,
                        deps: [Http, BaseRequestOptions]
                    },
                    {
                        provide: Http,
                        useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                            return new Http(mockBackend, options);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    ErrorService, UserService, JwtEncoder, MailingService, MockBackend,
                    BaseRequestOptions, AuthConfiguration, UserFactory,
                    {
                        provide: LoaderService,
                        useClass: class {
                            hide = jasmine.createSpy("hide")
                            show = jasmine.createSpy("show")
                        },
                        deps: [NgProgress]
                    }, 
                    NgProgress
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(AccountComponent);

        component = target.componentInstance;

        target.detectChanges();
    });

    it("should send error to error service when data gathering fails", () => {
        let spyError = spyOn(component.errorService, "handleError").and.callFake(() => { return; });
        user$.error("Cant retrieve user");
        expect(spyError).toHaveBeenCalledWith("Cant retrieve user");
    });

    it("should get rid of subscription on destroy", () => {
        let spy = spyOn(component.subscription, "unsubscribe")
        target.destroy();
        expect(spy).toHaveBeenCalled();
    })

    describe("updatePicture", () => {
        it("should update profile picture", async(() => {
            component.user = new User({ user_id: "some_new_id" });


            let mockUserService = target.debugElement.injector.get(UserService);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let spyUpdateUserProfile = spyOn(mockUserService, "updateUserPictureUrl").and.returnValue(Promise.resolve(true))
            let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(true))
            let spyGetUser = spyOn(target.debugElement.injector.get(Auth), "getUser")

            component.updatePicture("picture_url");

            expect(spyUpdateUserProfile).toHaveBeenCalledWith("some_new_id", "picture_url");
            spyUpdateUserProfile.calls.mostRecent().returnValue
                .then(() => {
                    expect(spyGetUser).toHaveBeenCalled();
                })
                .then(() => {
                    expect(spyUpsert).toHaveBeenCalledWith(jasmine.objectContaining({ user_id: "some_new_id", picture: "picture_url" }))
                })
        }));

        it("should display error messgae when update profile picture fails", async(() => {
            component.user = new User({ user_id: "some_new_id" });


            let mockUserService = target.debugElement.injector.get(UserService);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let spyUpdateUserProfile = spyOn(mockUserService, "updateUserPictureUrl").and.returnValue(Promise.resolve(false))
            let spyUpsert = spyOn(mockUserFactory, "upsert")
            let spyGetUser = spyOn(target.debugElement.injector.get(Auth), "getUser")

            component.updatePicture("picture_url");

            expect(spyUpdateUserProfile).toHaveBeenCalledWith("some_new_id", "picture_url");
            spyUpdateUserProfile.calls.mostRecent().returnValue
                .then(() => {
                    expect(spyGetUser).not.toHaveBeenCalled();
                })
                .then(() => {
                    expect(spyUpsert).not.toHaveBeenCalled();
                })
        }));

        it("should display error messgae when update profile picture fails", async(() => {
            component.user = new User({ user_id: "some_new_id" });


            let mockUserService = target.debugElement.injector.get(UserService);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let spyUpdateUserProfile = spyOn(mockUserService, "updateUserPictureUrl").and.returnValue(Promise.resolve(true))
            let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(false))
            let spyGetUser = spyOn(target.debugElement.injector.get(Auth), "getUser")

            component.updatePicture("picture_url");

            expect(spyUpdateUserProfile).toHaveBeenCalledWith("some_new_id", "picture_url");
            spyUpdateUserProfile.calls.mostRecent().returnValue
                .then(() => {
                    expect(spyGetUser).toHaveBeenCalled();
                })
                .then(() => {
                    expect(spyUpsert).toHaveBeenCalledWith(jasmine.objectContaining({ user_id: "some_new_id", picture: "picture_url" }))
                })
        }));

    })

    describe("save", () => {
        it("should do nothing if form is invalid", async(() => {
            component.accountForm.setValue({
                firstname: "something",
                lastname: ""
            })

            let mockUserService = target.debugElement.injector.get(UserService);
            let spy = spyOn(mockUserService, "updateUserProfile")

            component.save();

            expect(spy).not.toHaveBeenCalled();
        }));

        it("should display correct confirmation messages  when update user profile succeed", async(() => {

            component.user = new User({ user_id: "some_new_id" });

            component.accountForm.setValue({
                firstname: "something",
                lastname: "else"
            });
            component.accountForm.markAsDirty();

            let mockUserService = target.debugElement.injector.get(UserService);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let spyUpdateUserProfile = spyOn(mockUserService, "updateUserProfile").and.returnValue(Promise.resolve(true))
            let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(true))
            let spyGetUser = spyOn(target.debugElement.injector.get(Auth), "getUser")
            component.save();

            expect(spyUpdateUserProfile).toHaveBeenCalledWith("some_new_id", "something", "else");
            spyUpdateUserProfile.calls.mostRecent().returnValue
                .then(() => {
                    expect(spyGetUser).toHaveBeenCalled();
                    expect(component.feedbackMessage).toBe("Successfully updated.")
                })
                .then(() => {
                    expect(spyUpsert).toHaveBeenCalledWith(jasmine.objectContaining({ user_id: "some_new_id", firstname: "something", lastname: "else" }))
                })
        }));

        it("should display correct error messages when update user profile fails", async(() => {
            component.user = new User({ user_id: "some_new_id" });

            component.accountForm.setValue({
                firstname: "something",
                lastname: "else"
            });
            component.accountForm.markAsDirty();

            let mockUserService = target.debugElement.injector.get(UserService);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let spyUpdateUserProfile = spyOn(mockUserService, "updateUserProfile").and.returnValue(Promise.resolve(false))
            let spyUpsert = spyOn(mockUserFactory, "upsert");
            let spyGetUser = spyOn(target.debugElement.injector.get(Auth), "getUser")
            component.save();

            expect(spyUpdateUserProfile).toHaveBeenCalledWith("some_new_id", "something", "else");
            spyUpdateUserProfile.calls.mostRecent().returnValue
                .then(() => {
                    expect(spyGetUser).not.toHaveBeenCalled();
                })
                .then(() => {
                    expect(spyUpsert).not.toHaveBeenCalled()
                })
                .catch(() => {
                    expect(this.errorMessage).toBe("Can't update your user information.")
                })
        }));

        it("should display correct confirmation messages  when sync user profile fails ", async(() => {
            component.user = new User({ user_id: "some_new_id" });

            component.accountForm.setValue({
                firstname: "something",
                lastname: "else"
            });
            component.accountForm.markAsDirty();

            let mockUserService = target.debugElement.injector.get(UserService);
            let mockUserFactory = target.debugElement.injector.get(UserFactory);
            let spyUpdateUserProfile = spyOn(mockUserService, "updateUserProfile").and.returnValue(Promise.resolve(true))
            let spyUpsert = spyOn(mockUserFactory, "upsert").and.returnValue(Promise.resolve(false))
            let spyGetUser = spyOn(target.debugElement.injector.get(Auth), "getUser")
            component.save();

            expect(spyUpdateUserProfile).toHaveBeenCalledWith("some_new_id", "something", "else");
            spyUpdateUserProfile.calls.mostRecent().returnValue
                .then(() => {
                    expect(spyGetUser).toHaveBeenCalled();
                })
                .then(() => {
                    expect(spyUpsert).toHaveBeenCalledWith(jasmine.objectContaining({ user_id: "some_new_id", firstname: "something", lastname: "else" }))
                })
                .catch(() => {
                    expect(this.errorMessage).toBe("Can't sync your user information.")
                })
        }));

    });

});
