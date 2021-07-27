
import {of as observableOf,  Observable } from 'rxjs';
import { SignupComponent } from "./signup.page";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";
import { IntercomModule } from "ng-intercom";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { Auth } from "../../../../core/authentication/auth.service";
import { DatasetFactory } from "../../../../core/http/map/dataset.factory";
import { UserFactory } from "../../../../core/http/user/user.factory";
import { TeamFactory } from "../../../../core/http/team/team.factory";
import { UserRoleService } from "../../../../shared/model/permission.data";
import { AuthHttp } from "angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../../core/mocks/authhttp.helper.shared";
import { Http, BaseRequestOptions } from "@angular/http";
import { AuthConfiguration } from "../../../../core/authentication/auth.config";
import { JwtEncoder } from "../../../../shared/services/encoding/jwt.service";
import { MailingService } from "../../../../shared/services/mailing/mailing.service";
import { MockBackend } from "@angular/http/testing";
import { Router, NavigationStart } from "@angular/router";
import { LoaderService } from "../../../../shared/components/loading/loader.service";
import { UserService } from "../../../../shared/services/user/user.service";
import { User } from "../../../../shared/model/user.data";
import { AnalyticsModule } from "../../../../core/analytics.module";

describe("signup.component.ts", () => {
  let component: SignupComponent;
  let target: ComponentFixture<SignupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SignupComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [RouterTestingModule, NgProgressModule, AnalyticsModule]
    })
      .overrideComponent(SignupComponent, {
        set: {
          providers: [
            Auth,
            DatasetFactory,
            UserFactory,
            TeamFactory,
            UserRoleService,
            {
              provide: AuthHttp,
              useFactory: authHttpServiceFactoryTesting,
              deps: [Http, BaseRequestOptions]
            },
            AuthConfiguration,
            JwtEncoder,
            MailingService,
            {
              provide: Http,
              useFactory: (
                mockBackend: MockBackend,
                options: BaseRequestOptions
              ) => {
                return new Http(mockBackend, options);
              },
              deps: [MockBackend, BaseRequestOptions]
            },
            {
              provide: Router,
              useClass: class {
                navigate = jest.fn();
                events = observableOf(new NavigationStart(0, "/next"));
              }
            },
            {
              provide: LoaderService,
              useClass: class {
                hide = jest.fn();
                show = jest.fn();
              },
              deps: [NgProgress]
            },
            MockBackend,
            BaseRequestOptions,
            UserService,
            NgProgress
          ]
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    target = TestBed.createComponent(SignupComponent);

    component = target.componentInstance;
  });

  describe("createAccount", () => {
    it("doesnt do anything if the form are not valid", waitForAsync(() => {
      component.signupForm.setValue({
        firstname: "something",
        lastname: "something",
        email: "something@else.com"
        // confirmedEmail: "someone@else.com",
        // isTermsAccepted: true
      });

      let mockUserService = target.debugElement.injector.get(UserService);
      let spy = spyOn(mockUserService, "isUserExist").and.returnValue(
        Promise.resolve(true)
      );

      component.createAccount();

      expect(spy).not.toHaveBeenCalled();
    }));

    it("should display 'activate' message if user exits and activtion is pending", waitForAsync(() => {
      component.signupForm.setValue({
        firstname: "something",
        lastname: "something",
        email: "someone@else.com"
        // confirmedEmail: "someone@else.com",
        // isTermsAccepted: true
      });
      component.signupForm.markAsDirty();

      let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(
        Promise.resolve(true)
      );
      let spyActivationPending = spyOn(
        component,
        "isActivationPending"
      ).and.returnValue(
        Promise.resolve({ isActivationPending: true, userToken: "token" })
      );

      component.createAccount();
      expect(spyEmailExists).toHaveBeenCalled();
      expect(spyActivationPending).toHaveBeenCalled();

      Promise.all([
        spyEmailExists.calls.mostRecent().returnValue,
        spyActivationPending.calls.mostRecent().returnValue
      ]).then(([isEmailExist, { isActivationPending, userToken }]) => {
        expect(component.isRedirectToActivate).toBe(true);
      });
    }));

    it("should display 'login' message if user exits and activtion is not pending", waitForAsync(() => {
      component.signupForm.setValue({
        firstname: "something",
        lastname: "something",
        email: "someone@else.com"
        // confirmedEmail: "someone@else.com",
        // isTermsAccepted: true
      });
      component.signupForm.markAsDirty();

      let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(
        Promise.resolve(true)
      );
      let spyActivationPending = spyOn(
        component,
        "isActivationPending"
      ).and.returnValue(
        Promise.resolve({ isActivationPending: false, userToken: "token" })
      );

      component.createAccount();
      expect(spyEmailExists).toHaveBeenCalled();
      expect(spyActivationPending).toHaveBeenCalled();

      Promise.all([
        spyEmailExists.calls.mostRecent().returnValue,
        spyActivationPending.calls.mostRecent().returnValue
      ]).then(([isEmailExist, { isActivationPending, userToken }]) => {
        expect(component.isEmailAlreadyExist).toBe(true);
      });
    }));

    it("should signup user when email doesnt exist and display confirmation message", waitForAsync(() => {
      component.signupForm.setValue({
        firstname: "something",
        lastname: "something",
        email: "someone@else.com"
        // confirmedEmail: "someone@else.com",
        // isTermsAccepted: true
      });
      component.signupForm.markAsDirty();

      let mockUserService = target.debugElement.injector.get(UserService);
      let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(
        Promise.resolve(false)
      );
      let spyActivationPending = spyOn(
        component,
        "isActivationPending"
      ).and.returnValue(
        Promise.resolve({ isActivationPending: false, userToken: "token" })
      );
      let spyCreateUser = spyOn(mockUserService, "createUser").and.returnValue(
        Promise.resolve(new User({ user_id: "new_id" }))
      );
      let spySendConfirmation = spyOn(
        mockUserService,
        "sendConfirmation"
      ).and.returnValue(Promise.resolve(true));

      component.createAccount();

      Promise.all([
        spyEmailExists.calls.mostRecent().returnValue,
        spyActivationPending.calls.mostRecent().returnValue
      ]).then(([isEmailExist, { isActivationPending, userToken }]) => {
        expect(spyCreateUser).toHaveBeenCalled();

        spyCreateUser.calls
          .mostRecent()
          .returnValue.then(() => {})
          .then(() => {
            expect(spySendConfirmation).toHaveBeenCalled();
            spySendConfirmation.calls
              .mostRecent()
              .returnValue.then((isSent: boolean) => {
                expect(component.isConfirmationEmailSent).toBe(isSent);
              });
          });
      });
    }));

    it("should signup user when email doesnt exist and display error message when user can't be created", waitForAsync(() => {
      component.signupForm.setValue({
        firstname: "something",
        lastname: "something",
        email: "someone@else.com"
        // confirmedEmail: "someone@else.com",
        // isTermsAccepted: true
      });
      component.signupForm.markAsDirty();

      let mockUserService = target.debugElement.injector.get(UserService);
      let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(
        Promise.resolve(false)
      );
      let spyActivationPending = spyOn(
        component,
        "isActivationPending"
      ).and.returnValue(
        Promise.resolve({ isActivationPending: false, userToken: "token" })
      );
      let spyCreateUser = spyOn(mockUserService, "createUser").and.returnValue(
        Promise.reject("Account creation failed")
      );
      spyOn(mockUserService, "sendConfirmation").and.returnValue(
        Promise.resolve(true)
      );

      component.createAccount();

      Promise.all([
        spyEmailExists.calls.mostRecent().returnValue,
        spyActivationPending.calls.mostRecent().returnValue
      ]).then(([isEmailExist, { isActivationPending, userToken }]) => {
        expect(spyCreateUser).toHaveBeenCalled();
        spyCreateUser.calls
          .mostRecent()
          .returnValue.then(() => {})
          .catch((reason: string) => {
            expect(reason).toBe(`Account creation failed`);
          });
      });
    }));

    it("should signup user when email doesnt exist and display error message when email cannot be sent", waitForAsync(() => {
      component.signupForm.setValue({
        firstname: "something",
        lastname: "something",
        email: "someone@else.com"
        // confirmedEmail: "someone@else.com",
        // isTermsAccepted: true
      });
      component.signupForm.markAsDirty();

      let mockUserService = target.debugElement.injector.get(UserService);
      let spyEmailExists = spyOn(component, "isEmailExist").and.returnValue(
        Promise.resolve(false)
      );
      let spyActivationPending = spyOn(
        component,
        "isActivationPending"
      ).and.returnValue(
        Promise.resolve({ isActivationPending: false, userToken: "token" })
      );
      let spyCreateUser = spyOn(mockUserService, "createUser").and.returnValue(
        Promise.resolve(new User({ user_id: "new_id" }))
      );
      let spySendConfirmation = spyOn(
        mockUserService,
        "sendConfirmation"
      ).and.returnValue(Promise.reject("Confirmation email failed to send"));

      component.createAccount();

      Promise.all([
        spyEmailExists.calls.mostRecent().returnValue,
        spyActivationPending.calls.mostRecent().returnValue
      ]).then(([isEmailExist, { isActivationPending, userToken }]) => {
        expect(spyCreateUser).toHaveBeenCalled();

        spyCreateUser.calls
          .mostRecent()
          .returnValue.then(() => {})
          .then(() => {
            expect(spySendConfirmation).toHaveBeenCalled();
            spySendConfirmation.calls
              .mostRecent()
              .returnValue.catch((reason: string) => {
                expect(reason).toBe("Confirmation email failed to send");
              });
          });
      });
    }));
  });

  describe("isActivationPending", () => {
    it("returns correct values if user doesnt exist", waitForAsync(() => {
      let mockUserService = target.debugElement.injector.get(UserService);
      let spy = spyOn(
        mockUserService,
        "isActivationPendingByEmail"
      ).and.returnValue(
        Promise.resolve({ isActivationPending: undefined, user_id: undefined })
      );
      component
        .isActivationPending("donotexist@company.com", "not", "here")
        .then(({ isActivationPending, userToken }) => {
          expect(isActivationPending).toBeFalsy();
          expect(userToken).toBeUndefined();
          expect(spy).toHaveBeenCalledWith("donotexist@company.com");
        });
    }));

    it("returns correct values if user exists and activation is pending", waitForAsync(() => {
      let mockUserService = target.debugElement.injector.get(UserService);
      let spy = spyOn(
        mockUserService,
        "isActivationPendingByEmail"
      ).and.returnValue(
        Promise.resolve({
          isActivationPending: true,
          user_id: "some_random_id"
        })
      );
      spyOn(mockUserService, "generateUserToken").and.returnValue(
        Promise.resolve("some_token")
      );
      component
        .isActivationPending("exist@company.com", "iam", "here")
        .then(({ isActivationPending, userToken }) => {
          expect(isActivationPending).toBeTruthy();
          expect(userToken).toBe("some_token");
          expect(spy).toHaveBeenCalledWith("exist@company.com");
        });
    }));

    it("returns correct values if user exists and activation is pending", waitForAsync(() => {
      let mockUserService = target.debugElement.injector.get(UserService);
      let spy = spyOn(
        mockUserService,
        "isActivationPendingByEmail"
      ).and.returnValue(
        Promise.resolve({
          isActivationPending: false,
          user_id: "some_random_id"
        })
      );
      spyOn(mockUserService, "generateUserToken").and.returnValue(
        Promise.resolve("some_token")
      );
      component
        .isActivationPending("exist@company.com", "iam", "here")
        .then(({ isActivationPending, userToken }) => {
          expect(isActivationPending).toBeFalsy();
          expect(userToken).toBe("some_token");
          expect(spy).toHaveBeenCalledWith("exist@company.com");
        });
    }));
  });

  describe("isEmailExist", () => {
    it("should return true when email exists", () => {
      let mockUserService = target.debugElement.injector.get(UserService);
      let spy = spyOn(mockUserService, "isUserExist").and.returnValue(
        Promise.resolve(true)
      );
      component.isEmailExist("i@doexist.com").then(result => {
        expect(spy).toHaveBeenCalledWith("i@doexist.com");
        expect(result).toBe(true);
      });
    });

    it("should return false when email exists", () => {
      let mockUserService = target.debugElement.injector.get(UserService);
      let spy = spyOn(mockUserService, "isUserExist").and.returnValue(
        Promise.resolve(false)
      );
      component.isEmailExist("i@dontexist.com").then(result => {
        expect(spy).toHaveBeenCalledWith("i@dontexist.com");
        expect(result).toBe(false);
      });
    });
  });
});
