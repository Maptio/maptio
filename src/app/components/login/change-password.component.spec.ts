import { AuthHttp } from "angular2-jwt";
import { MailingService } from "./../../shared/services/mailing/mailing.service";
import { JwtEncoder } from "./../../shared/services/encoding/jwt.service";
import { AuthConfiguration } from "./../../shared/services/auth/auth.config";
import { Http, BaseRequestOptions } from "@angular/http";
import { UserService } from "./../../shared/services/user/user.service";
import { ChangePasswordComponent } from "./change-password.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ComponentFixture, async } from "@angular/core/testing";
import { LoaderService } from "./../../shared/services/loading/loader.service";
import { Router } from "@angular/router";
import { Auth } from "../../shared/services/auth/auth.service";
import { User } from "../../shared/model/user.data";
import { MockBackend } from "@angular/http/testing";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";

describe("change-password.component.ts", () => {

    let component: ChangePasswordComponent;
    let target: ComponentFixture<ChangePasswordComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [ChangePasswordComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(ChangePasswordComponent, {
            set: {
                providers: [
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
                    // { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                    MockBackend,
                    BaseRequestOptions,
                    UserService, AuthConfiguration, JwtEncoder, MailingService,
                    { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                    LoaderService
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(ChangePasswordComponent);

        component = target.componentInstance;
    });

    it("should not do anything is the form is not valid", () => {
        component.changePasswordForm.setValue({
            email: "notanemails"
        })

        let mockUserService = target.debugElement.injector.get(UserService);
        let spy = spyOn(mockUserService, "isActivationPendingByEmail")

        component.resetPassword();

        expect(spy).not.toHaveBeenCalled();
    });

    it("should diplay error message if user has pending activation", async(() => {

        component.changePasswordForm.setValue({
            email: "someone@else.com"
        })
        component.changePasswordForm.markAsDirty();

        let mockUserService = target.debugElement.injector.get(UserService);
        let spyActivationPending = spyOn(mockUserService, "isActivationPendingByEmail").and.returnValue(Promise.resolve({ isActivationPending: true, user_id: "user_id" }))
        let spyChangePassword = spyOn(mockUserService, "changePassword");

        component.resetPassword();
        expect(spyActivationPending).toHaveBeenCalledWith("someone@else.com")
        spyActivationPending.calls.mostRecent().returnValue
            .then((result: { isActivationPending: boolean, user_id: string }) => {
                expect(component.errorMessage).not.toBeUndefined();
                expect(spyChangePassword).not.toHaveBeenCalled();
            })


    }));

    it("should chnage password and display confirmation message if email is not pending activation", async(() => {

        component.changePasswordForm.setValue({
            email: "someone@else.com"
        })
        component.changePasswordForm.markAsDirty();

        let mockUserService = target.debugElement.injector.get(UserService);
        let spyActivationPending = spyOn(mockUserService, "isActivationPendingByEmail").and.returnValue(Promise.resolve({ isActivationPending: false, user_id: "user_id" }))
        let spyChangePassword = spyOn(mockUserService, "changePassword");
        component.resetPassword();
        expect(spyActivationPending).toHaveBeenCalledWith("someone@else.com")
        spyActivationPending.calls.mostRecent().returnValue
            .then((result: { isActivationPending: boolean, user_id: string }) => {
                expect(spyChangePassword).toHaveBeenCalled();
            })


    }));



});
