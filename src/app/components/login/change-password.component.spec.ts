import { ChangePasswordComponent } from "./change-password.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ComponentFixture, async } from "@angular/core/testing";
import { LoaderService } from "./../../shared/services/http/loader.service";
import { Router } from "@angular/router";
import { Auth } from "../../shared/services/auth/auth.service";
import { User } from "../../shared/model/user.data";

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
                        provide: Auth, useClass: class {
                            isActivationPendingByEmail(email: string) { return; }
                            changePassword(email: string) { return; }
                        }
                    },
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

        let mockAuth = target.debugElement.injector.get(Auth);
        let spy = spyOn(mockAuth, "isActivationPendingByEmail")

        component.resetPassword();

        expect(spy).not.toHaveBeenCalled();
    });

    it("should diplay error message if user has pending activation", async(() => {

        component.changePasswordForm.setValue({
            email: "someone@else.com"
        })
        component.changePasswordForm.markAsDirty();

        let mockAuth = target.debugElement.injector.get(Auth);
        let spyActivationPending = spyOn(mockAuth, "isActivationPendingByEmail").and.returnValue(Promise.resolve({ isActivationPending: true, user_id: "user_id" }))
        let spyChangePassword = spyOn(mockAuth, "changePassword");

        component.resetPassword();
        expect(spyActivationPending).toHaveBeenCalledWith("someone@else.com")
        spyActivationPending.calls.mostRecent().returnValue
            .then(({ isActivationPending: boolean, user_id: string }) => {
                expect(component.errorMessage).not.toBeUndefined();
                expect(spyChangePassword).not.toHaveBeenCalled();
            })


    }));

    it("should chnage password and display confirmation message if email is not pending activation", async(() => {

        component.changePasswordForm.setValue({
            email: "someone@else.com"
        })
        component.changePasswordForm.markAsDirty();

        let mockAuth = target.debugElement.injector.get(Auth);
        let spyActivationPending = spyOn(mockAuth, "isActivationPendingByEmail").and.returnValue(Promise.resolve({ isActivationPending: false, user_id: "user_id" }))
        let spyChangePassword = spyOn(mockAuth, "changePassword");
        component.resetPassword();
        expect(spyActivationPending).toHaveBeenCalledWith("someone@else.com")
        spyActivationPending.calls.mostRecent().returnValue
            .then(({ isActivationPending: boolean, user_id: string }) => {
                expect(spyChangePassword).toHaveBeenCalled();
            })


    }));



});
