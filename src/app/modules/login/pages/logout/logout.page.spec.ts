import { LogoutComponent } from "./logout.page";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { SafePipe } from "../../../../shared/pipes/safe.pipe";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Auth } from "../../../../core/authentication/auth.service";

describe("logout.component.ts", () => {
  let component: LogoutComponent;
  let target: ComponentFixture<LogoutComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [LogoutComponent, SafePipe],
        imports: [],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .overrideComponent(LogoutComponent, {
          set: {
            providers: [
              {
                provide: Auth,
                useClass: class {
                  logout = jasmine.createSpy("logout");
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

    target.detectChanges();
  });

  it("should clear localStorage", () => {
    expect(target.debugElement.injector.get(Auth).logout).toHaveBeenCalled();
  });
});
