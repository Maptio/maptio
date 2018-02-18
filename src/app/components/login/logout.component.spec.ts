import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ComponentFixture, async } from "@angular/core/testing";
import { Router, NavigationStart } from "@angular/router";
import { LogoutComponent } from "./logout.component";
import { Observable } from "rxjs/Rx";
import { RouterTestingModule } from "@angular/router/testing";
import { Auth } from "../../shared/services/auth/auth.service";

describe("logout.component.ts", () => {
  let component: LogoutComponent;
  let target: ComponentFixture<LogoutComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [LogoutComponent],
        imports: [RouterTestingModule],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .overrideComponent(LogoutComponent, {
          set: {
            providers: [
              {
                provide: Auth,
                useClass: class {
                  clear = jasmine.createSpy("clear");
                }
              },
              {
                provide: Router,
                useClass: class {
                  navigate = jasmine.createSpy("navigate");
                  navigateByUrl = jasmine.createSpy("navigateByUrl");
                  events = Observable.of(new NavigationStart(0, "/next"));
                }
              }
            ]
          }
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    target = TestBed.createComponent(LogoutComponent);

    component = target.componentInstance;
    // spyOn(target.debugElement.injector.get(Auth), "clear");

    target.detectChanges();
  });

  it("should clear localStorage", () => {
    expect(target.debugElement.injector.get(Auth).clear).toHaveBeenCalled();
  });

  it("should redirect to home", () => {
    expect(
      target.debugElement.injector.get(Router).navigateByUrl
    ).toHaveBeenCalledWith("/home");
  });
});
