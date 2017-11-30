import { DashboardComponent } from "./../dashboard/dashboard.component";
import { SignupComponent } from "./../login/signup.component";
import { HomeComponent } from "./home.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Auth } from "../../shared/services/auth/auth.service";

export class AuthStub {
    authenticate() {
        return;
    }

    allAuthenticated() {
        return true;
    }
}

describe("home.component.ts", () => {
    let component: HomeComponent;
    let target: ComponentFixture<HomeComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HomeComponent, SignupComponent, DashboardComponent]
        }).overrideComponent(HomeComponent, {
            set: {
                providers: [
                    { provide: Auth, useClass: AuthStub }
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(HomeComponent);
        component = target.componentInstance;

        target.detectChanges();

    });
});
