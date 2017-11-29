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
import { Router, NavigationStart } from "@angular/router";
import { Auth } from "../../shared/services/auth/auth.service";
import { User } from "../../shared/model/user.data";
import { MockBackend } from "@angular/http/testing";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { LogoutComponent } from "./logout.component";
import { Observable } from "rxjs/Rx";
import { RouterTestingModule } from "@angular/router/testing";

describe("logout.component.ts", () => {

    let component: LogoutComponent;
    let target: ComponentFixture<LogoutComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [LogoutComponent],
            imports: [RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(LogoutComponent, {
            set: {
                providers: [
                    {
                        provide: Router, useClass: class {
                            navigate = jasmine.createSpy("navigate");
                            navigateByUrl = jasmine.createSpy("navigateByUrl");
                            events = Observable.of(new NavigationStart(0, "/next"))
                        }
                    }
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(LogoutComponent);

        component = target.componentInstance;
        spyOn(localStorage, "clear");

        target.detectChanges();
    });

    it("should clear localStorage", () => {
        expect(localStorage.clear).toHaveBeenCalled();
    });

    it("should redirect to home", () => {
        expect(target.debugElement.injector.get(Router).navigateByUrl).toHaveBeenCalledWith("/home")
    });




});
