import { ErrorService } from "./../../shared/services/error/error.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Subject } from "rxjs/Rx";
import { AccountComponent } from "./account.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { User } from "../../shared/model/user.data";
import { Auth } from "../../shared/services/auth/auth.service";

describe("account.component.ts", () => {

    let component: AccountComponent;
    let target: ComponentFixture<AccountComponent>;
    let user$: Subject<User> = new Subject<User>();
    let AuthStub;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [AccountComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).overrideComponent(AccountComponent, {
            set: {
                providers: [
                    { provide: Auth, useClass: class { getUser() { return user$.asObservable() } } },
                    ErrorService
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(AccountComponent);

        component = target.componentInstance;

        target.detectChanges();
    });

    it("should gather user data", () => {
        user$.next(new User({ user_id: "some_new_id" }));
        expect(component.user.user_id).toBe("some_new_id");
        // TODO : Test that auth.getUser() is called (but how?)
    });

    it("should send error to error service when data gathering fails", () => {
        // let errorService = target.debugElement.injector.get(ErrorService);
        let spyError = spyOn(component.errorService, "handleError").and.callFake(() => { return; });
        user$.error("Cant retrieve user");
        expect(spyError).toHaveBeenCalledWith("Cant retrieve user");
    });

    it("should get rid of subscription on destroy", () => {
        let spy = spyOn(component.subscription, "unsubscribe")
        target.destroy();
        expect(spy).toHaveBeenCalled();
    })



});
