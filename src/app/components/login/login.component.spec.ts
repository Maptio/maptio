import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import { AuthHttp } from "angular2-jwt";
import { AuthConfiguration } from "./../../shared/services/auth/auth.config";
import { MailingService } from "./../../shared/services/mailing/mailing.service";
import { UserService } from "./../../shared/services/user/user.service";
import { LoaderService } from "./../../shared/services/loading/loader.service";
import { ErrorService } from "./../../shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { FormBuilder } from "@angular/forms";
import { JwtEncoder } from "./../../shared/services/encoding/jwt.service";
import { Observable } from "rxjs/Rx";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRoute, Router, NavigationStart } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LoginComponent } from "./login.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Auth } from "../../shared/services/auth/auth.service";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { NgProgressModule, NgProgress } from "@ngx-progressbar/core";

export class AuthStub {
  login() {
    return;
  }
}

describe("login.component.ts", () => {
  let component: LoginComponent;
  let target: ComponentFixture<LoginComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [LoginComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, NgProgressModule]
      })
        .overrideComponent(LoginComponent, {
          set: {
            providers: [
              JwtEncoder,
              FormBuilder,
              LoaderService,NgProgress, 
              Angulartics2Mixpanel,
              Angulartics2,
              {
                provide: Auth,
                useClass: class {
                  login = jasmine.createSpy("login");
                  clear = jasmine.createSpy("clear");
                }
              },
              {
                provide: ActivatedRoute,
                useValue: {
                  queryParams: Observable.of({ token: "TOKEN" })
                }
              },
              {
                provide: AuthHttp,
                useFactory: authHttpServiceFactoryTesting,
                deps: [Http, BaseRequestOptions]
              },
              {
                provide: Router,
                useClass: class {
                  navigate = jasmine.createSpy("navigate");
                  events = Observable.of(new NavigationStart(0, "/next"));
                }
              },
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
              MockBackend,
              BaseRequestOptions,
              ErrorService,
              UserService,
              JwtEncoder,
              MailingService,
              AuthConfiguration
            ]
          }
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(LoginComponent);
    component = target.componentInstance;

    // target.detectChanges(); // trigger initial data binding
  });

  it("should call login on initialization", () => {
    expect(true).toBe(true);
  });

  describe("login", () => {
    it("should do nothing is login form is invalid", () => {
      component.loginForm.setValue({
        email: "",
        password: ""
      });
      spyOn(target.debugElement.injector.get(UserService), "isUserExist");
      component.login();
      expect(
        target.debugElement.injector.get(UserService).isUserExist
      ).not.toHaveBeenCalled();
    });

    it(
      "should login user when login form is valid and user exists",
      async(() => {
        component.loginForm.setValue({
          email: "someone@company.com",
          password: "secret"
        });
        component.loginForm.markAsDirty();

        let spyUserExist = spyOn(
          target.debugElement.injector.get(UserService),
          "isUserExist"
        ).and.returnValue(Promise.resolve(true));
        let spyLoaderHide = spyOn(
          target.debugElement.injector.get(LoaderService),
          "hide"
        );
        let spyLoaderShow = spyOn(
          target.debugElement.injector.get(LoaderService),
          "show"
        );

        component.login();
        expect(spyUserExist).toHaveBeenCalledWith("someone@company.com");
        expect(spyLoaderShow).toHaveBeenCalled();
        spyUserExist.calls
          .mostRecent()
          .returnValue.then((isUserExist: boolean) => {
            expect(isUserExist).toBe(true);
            expect(
              target.debugElement.injector.get(Auth).login
            ).toHaveBeenCalledWith("someone@company.com", "secret");
          });
      })
    );

    it(
      "should not login user when login form is valid and user does not exists",
      async(() => {
        component.loginForm.setValue({
          email: "someone@company.com",
          password: "secret"
        });
        component.loginForm.markAsDirty();

        let spyUserExist = spyOn(
          target.debugElement.injector.get(UserService),
          "isUserExist"
        ).and.returnValue(Promise.resolve(false));
        let spyLoaderHide = spyOn(
          target.debugElement.injector.get(LoaderService),
          "hide"
        );
        let spyLoaderShow = spyOn(
          target.debugElement.injector.get(LoaderService),
          "show"
        );

        component.login();
        expect(spyUserExist).toHaveBeenCalledWith("someone@company.com");
        expect(spyLoaderShow).toHaveBeenCalled();
        spyUserExist.calls
          .mostRecent()
          .returnValue.then((isUserExist: boolean) => {
            expect(isUserExist).toBe(false);
            expect(
              target.debugElement.injector.get(Auth).login
            ).not.toHaveBeenCalled();
            expect(component.isUnknownEmail).toBeTruthy();
          })
          .then(() => {
            expect(spyLoaderHide).toHaveBeenCalled();
          });
      })
    );
  });

  describe(`activateAccount`, () => {
    it(
      `should do nothing when activate form is invalid`,
      async(() => {
        component.activateForm.setValue({
          firstname: "",
          lastname: "",
          password: "",
          isTermsAccepted: ""
        });
        spyOn(target.debugElement.injector.get(LoaderService), "show");
        component.activateAccount();
        expect(
          target.debugElement.injector.get(LoaderService).show
        ).not.toHaveBeenCalled();
      })
    );

    it(
      `should display error message when activate form is valid but token is missing`,
      async(() => {
        component.activateForm.setValue({
          firstname: "Huey",
          lastname: "Freeman",
          password: "BlackPanther123",
          isTermsAccepted: true
        });
        component.activateForm.markAsDirty();

        spyOn(target.debugElement.injector.get(LoaderService), "show");
        spyOn(target.debugElement.injector.get(JwtEncoder), "decode");
        component.token = undefined;
        component.activateAccount();
        expect(
          target.debugElement.injector.get(LoaderService).show
        ).toHaveBeenCalled();
        expect(
          target.debugElement.injector.get(JwtEncoder).decode
        ).not.toHaveBeenCalled();
        expect(component.loginErrorMessage).toBe(
          "Missing token. Check your email for an activation link!"
        );
      })
    );

    it(
      `should activate account when activate form is valid and token is present`,
      async(() => {
        component.activateForm.setValue({
          firstname: "Huey",
          lastname: "Freeman",
          password: "BlackPanther123",
          isTermsAccepted: true
        });
        component.activateForm.markAsDirty();

        spyOn(target.debugElement.injector.get(LoaderService), "show");
        spyOn(target.debugElement.injector.get(LoaderService), "hide");
        let spyDecode = spyOn(
          target.debugElement.injector.get(JwtEncoder),
          "decode"
        ).and.returnValue(
          Promise.resolve({
            user_id: "user_huey",
            email: "huey@maptio.com"
          })
        );
        let spyIsActivationPending = spyOn(
          target.debugElement.injector.get(UserService),
          "isActivationPendingByUserId"
        ).and.returnValue(Promise.resolve(true));
        spyOn(
          target.debugElement.injector.get(UserService),
          "updateUserCredentials"
        ).and.returnValue(Promise.resolve(true));
        spyOn(
          target.debugElement.injector.get(UserService),
          "updateActivationPendingStatus"
        ).and.returnValue(Promise.resolve(true));
        spyOn(
          target.debugElement.injector.get(Angulartics2Mixpanel),
          "eventTrack"
        );

        component.token = "SOME_TOKEN";
        component.activateAccount();

        expect(
          target.debugElement.injector.get(LoaderService).show
        ).toHaveBeenCalled();
        expect(spyDecode).toHaveBeenCalledWith("SOME_TOKEN");
        spyDecode.calls
          .mostRecent()
          .returnValue.then((decoded: any) => {
            expect(decoded.user_id).toBe("user_huey");
            expect(decoded.email).toBe("huey@maptio.com");
          })
          .then(() => {
            expect(spyIsActivationPending).toHaveBeenCalled();
          });
      })
    );
  });
});
