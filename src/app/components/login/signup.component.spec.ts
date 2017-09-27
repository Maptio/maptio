import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ComponentFixture, async } from "@angular/core/testing";
import { LoaderService } from "./../../shared/services/loading/loader.service";
import { Router } from "@angular/router";
import { SignupComponent } from "./signup.component";
import { Auth } from "../../shared/services/auth/auth.service";
import { User } from "../../shared/model/user.data";

describe("signup.component.ts", () => {

    let component: SignupComponent;
    let target: ComponentFixture<SignupComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [SignupComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(SignupComponent, {
            set: {
                providers: [
                    {
                        provide: Auth, useClass: class {
                            isActivationPendingByEmail(email: string) { return; }
                            generateUserToken(user_id: string, email: string, firstname: string, lastname: string) { return; }
                            isUserExist(email: string) { return; }
                            createUser(email: string, firstname: string, lastname: string, isSignUp: boolean) { return; }
                            sendConfirmation(email: string, userId: string, firstname: string, lastname: string, name: string) { return; }
                        }
                    },
                    { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
                    LoaderService
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(SignupComponent);

        component = target.componentInstance;
    });


    describe("createAccount", () => {
        it("doesnt do anything if the form are not valid", () => {
            component.signupForm.setValue({
                firstname: "something",
                lastname: "something",
                email: "something@else.com",
                confirmedEmail: "someone@else.com",
                isTermsAccepted: true
            })

            let mockAuth = target.debugElement.injector.get(Auth);
            let spy = spyOn(mockAuth, "isUserExist").and.returnValue(Promise.resolve(true));

            component.createAccount();

            expect(spy).not.toHaveBeenCalled();
        });

        it("should display 'activate' message if user exits and activtion is pending", async(() => {
            component.signupForm.setValue({
                firstname: "something",
                lastname: "something",
                email: "someone@else.com",
                confirmedEmail: "someone@else.com",
                isTermsAccepted: true
            })
            component.signupForm.markAsDirty();

            let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(Promise.resolve(true));
            let spyActivationPending = spyOn(component, "isActivationPending").and.returnValue(Promise.resolve({ isActivationPending: true, userToken: "token" }));

            component.createAccount();
            expect(spyEmailExists).toHaveBeenCalled();
            expect(spyActivationPending).toHaveBeenCalled();

            Promise.all([spyEmailExists.calls.mostRecent().returnValue, spyActivationPending.calls.mostRecent().returnValue])
                .then(([isEmailExist, { isActivationPending, userToken }]) => {
                    expect(component.isRedirectToActivate).toBe(true)
                })
        }));

        it("should display 'login' message if user exits and activtion is not pending", async(() => {
            component.signupForm.setValue({
                firstname: "something",
                lastname: "something",
                email: "someone@else.com",
                confirmedEmail: "someone@else.com",
                isTermsAccepted: true
            })
            component.signupForm.markAsDirty();

            let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(Promise.resolve(true));
            let spyActivationPending = spyOn(component, "isActivationPending").and.returnValue(Promise.resolve({ isActivationPending: false, userToken: "token" }));

            component.createAccount();
            expect(spyEmailExists).toHaveBeenCalled();
            expect(spyActivationPending).toHaveBeenCalled();

            Promise.all([spyEmailExists.calls.mostRecent().returnValue, spyActivationPending.calls.mostRecent().returnValue])
                .then(([isEmailExist, { isActivationPending, userToken }]) => {
                    expect(component.isEmailAlreadyExist).toBe(true)
                })
        }));

        it("should signup user when email doesnt exist and display confirmation message", async(() => {
            component.signupForm.setValue({
                firstname: "something",
                lastname: "something",
                email: "someone@else.com",
                confirmedEmail: "someone@else.com",
                isTermsAccepted: true
            })
            component.signupForm.markAsDirty();

            let mockAuth = target.debugElement.injector.get(Auth);
            let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(Promise.resolve(false));
            let spyActivationPending = spyOn(component, "isActivationPending").and.returnValue(Promise.resolve({ isActivationPending: false, userToken: "token" }));
            let spyCreateUser = spyOn(mockAuth, "createUser").and.returnValue(Promise.resolve(new User({ user_id: "new_id" })))
            let spySendConfirmation = spyOn(mockAuth, "sendConfirmation").and.returnValue(Promise.resolve(true))

            component.createAccount();

            Promise.all([spyEmailExists.calls.mostRecent().returnValue, spyActivationPending.calls.mostRecent().returnValue])
                .then(([isEmailExist, { isActivationPending, userToken }]) => {
                    expect(spyCreateUser).toHaveBeenCalled();

                    spyCreateUser.calls.mostRecent().returnValue
                        .then(() => {

                        })
                        .then(() => {
                            expect(spySendConfirmation).toHaveBeenCalled();
                            spySendConfirmation.calls.mostRecent().returnValue
                                .then((isSent: boolean) => {
                                    expect(component.isConfirmationEmailSent).toBe(isSent)
                                })
                        })
                })
        }));

        it("should signup user when email doesnt exist and display error message when user can't be created", async(() => {
            component.signupForm.setValue({
                firstname: "something",
                lastname: "something",
                email: "someone@else.com",
                confirmedEmail: "someone@else.com",
                isTermsAccepted: true
            })
            component.signupForm.markAsDirty();

            let mockAuth = target.debugElement.injector.get(Auth);
            let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(Promise.resolve(false));
            let spyActivationPending = spyOn(component, "isActivationPending").and.returnValue(Promise.resolve({ isActivationPending: false, userToken: "token" }));
            let spyCreateUser = spyOn(mockAuth, "createUser").and.returnValue(Promise.reject("Account creation failed"))
            let spySendConfirmation = spyOn(mockAuth, "sendConfirmation").and.returnValue(Promise.resolve(true))

            component.createAccount();

            Promise.all([spyEmailExists.calls.mostRecent().returnValue, spyActivationPending.calls.mostRecent().returnValue])
                .then(([isEmailExist, { isActivationPending, userToken }]) => {
                    expect(spyCreateUser).toHaveBeenCalled();
                    spyCreateUser.calls.mostRecent().returnValue.then(() => { })
                        .catch((reason: string) => {
                            expect(reason).toBe(`Account creation failed`);
                        })
                })
        }));

        it("should signup user when email doesnt exist and display error message when email cannot be sent", async(() => {
            component.signupForm.setValue({
                firstname: "something",
                lastname: "something",
                email: "someone@else.com",
                confirmedEmail: "someone@else.com",
                isTermsAccepted: true
            })
            component.signupForm.markAsDirty();

            let mockAuth = target.debugElement.injector.get(Auth);
            let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(Promise.resolve(false));
            let spyActivationPending = spyOn(component, "isActivationPending").and.returnValue(Promise.resolve({ isActivationPending: false, userToken: "token" }));
            let spyCreateUser = spyOn(mockAuth, "createUser").and.returnValue(Promise.resolve(new User({ user_id: "new_id" })))
            let spySendConfirmation = spyOn(mockAuth, "sendConfirmation").and.returnValue(Promise.reject("Confirmation email failed to send"))

            component.createAccount();

            Promise.all([spyEmailExists.calls.mostRecent().returnValue, spyActivationPending.calls.mostRecent().returnValue])
                .then(([isEmailExist, { isActivationPending, userToken }]) => {
                    expect(spyCreateUser).toHaveBeenCalled();

                    spyCreateUser.calls.mostRecent().returnValue
                        .then(() => {

                        })
                        .then(() => {
                            expect(spySendConfirmation).toHaveBeenCalled();
                            spySendConfirmation.calls.mostRecent().returnValue
                                .catch((reason: string) => {
                                    expect(reason).toBe("Confirmation email failed to send")
                                })
                        })
                })
        }));
    });

    describe("isActivationPending", () => {
        it("returns correct values if user doesnt exist", async(() => {
            let mockAuth = target.debugElement.injector.get(Auth);
            let spy = spyOn(mockAuth, "isActivationPendingByEmail").and.returnValue(Promise.resolve({ isActivationPending: undefined, user_id: undefined }))
            component.isActivationPending("donotexist@company.com", "not", "here").then(({ isActivationPending, userToken }) => {
                expect(isActivationPending).toBeFalsy()
                expect(userToken).toBeUndefined();
                expect(spy).toHaveBeenCalledWith("donotexist@company.com")
            });
        }));

        it("returns correct values if user exists and activation is pending", async(() => {
            let mockAuth = target.debugElement.injector.get(Auth);
            let spy = spyOn(mockAuth, "isActivationPendingByEmail").and.returnValue(Promise.resolve({ isActivationPending: true, user_id: "some_random_id" }))
            let spyGenerateToken = spyOn(mockAuth, "generateUserToken").and.returnValue(Promise.resolve("some_token"))
            component.isActivationPending("exist@company.com", "iam", "here").then(({ isActivationPending, userToken }) => {
                expect(isActivationPending).toBeTruthy()
                expect(userToken).toBe("some_token")
                expect(spy).toHaveBeenCalledWith("exist@company.com")
            });
        }));

        it("returns correct values if user exists and activation is pending", async(() => {
            let mockAuth = target.debugElement.injector.get(Auth);
            let spy = spyOn(mockAuth, "isActivationPendingByEmail").and.returnValue(Promise.resolve({ isActivationPending: false, user_id: "some_random_id" }))
            let spyGenerateToken = spyOn(mockAuth, "generateUserToken").and.returnValue(Promise.resolve("some_token"))
            component.isActivationPending("exist@company.com", "iam", "here").then(({ isActivationPending, userToken }) => {
                expect(isActivationPending).toBeFalsy();
                expect(userToken).toBe("some_token")
                expect(spy).toHaveBeenCalledWith("exist@company.com")
            });
        }));


    });

    describe("isEmailExist", () => {
        it("should return true when email exists", () => {
            let mockAuth = target.debugElement.injector.get(Auth);
            let spy = spyOn(mockAuth, "isUserExist").and.returnValue(Promise.resolve(true));
            component.isEmailExist("i@doexist.com").then(result => {
                expect(spy).toHaveBeenCalledWith("i@doexist.com");
                expect(result).toBe(true)
            })
        });

        it("should return false when email exists", () => {
            let mockAuth = target.debugElement.injector.get(Auth);
            let spy = spyOn(mockAuth, "isUserExist").and.returnValue(Promise.resolve(false));
            component.isEmailExist("i@dontexist.com").then(result => {
                expect(spy).toHaveBeenCalledWith("i@dontexist.com");
                expect(result).toBe(false)
            })
        });
    });

});
