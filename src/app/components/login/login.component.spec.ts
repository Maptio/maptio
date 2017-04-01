import { LoginComponent } from "./login.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Auth } from "../../shared/services/auth.service";

export class AuthStub {
    login() {
        return;
    }
}

describe("login.component.ts", () => {
    let component: LoginComponent;
    let target: ComponentFixture<LoginComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LoginComponent]
        }).overrideComponent(LoginComponent, {
            set: {
                providers: [
                    { provide: Auth, useClass: class { login = jasmine.createSpy("login"); } },
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(LoginComponent);
        component = target.componentInstance;

        target.detectChanges(); // trigger initial data binding
    });

    it("should call login on initialization", () => {
        let auth = target.debugElement.injector.get(Auth);
        component.ngOnInit();
        expect(auth.login).toHaveBeenCalled();
    })
});
