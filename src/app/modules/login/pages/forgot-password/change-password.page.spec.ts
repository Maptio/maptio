import { ChangePasswordComponent } from "./change-password.page";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { UserFactory } from "../../../../core/http/user/user.factory";
import { AuthHttp } from "angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../../core/mocks/authhttp.helper.shared";
import { Http, BaseRequestOptions } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { UserService } from "../../../../shared/services/user/user.service";
import { AuthConfiguration } from "../../../../core/authentication/auth.config";
import { JwtEncoder } from "../../../../shared/services/encoding/jwt.service";
import { MailingService } from "../../../../shared/services/mailing/mailing.service";
import { Router } from "@angular/router";
import { LoaderService } from "../../../../shared/components/loading/loader.service";

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
                    UserFactory,
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
