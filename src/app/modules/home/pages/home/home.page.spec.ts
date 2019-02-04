import { SignupComponent } from "../../../../components/login/signup.component";
import { HomeComponent } from "./home.page";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Auth } from "../../../../core/authentication/auth.service";
import { DashboardComponent } from "../../components/dashboard/dashboard.component";

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
