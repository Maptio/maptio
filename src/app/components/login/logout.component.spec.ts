import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ComponentFixture, async } from "@angular/core/testing";
import { Router, NavigationStart } from "@angular/router";
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
