import { HomeComponent } from "./home.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Auth } from "../../shared/services/auth/auth.service";

describe("home.component.ts", () => {
    let component: HomeComponent;
    let target: ComponentFixture<HomeComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HomeComponent]
        }).overrideComponent(HomeComponent, {
            set: {
                providers: [
                    { provide: Auth, useClass: class { authenticated = jasmine.createSpy("authenticated"); } },
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(HomeComponent);
        component = target.componentInstance;

        target.detectChanges(); // trigger initial data binding
    });

    it("all dependencies are provided", () => {
        expect(true).toBe(true);
    })
});
