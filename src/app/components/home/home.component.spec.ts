import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterTestingModule } from "@angular/router/testing";
import { DashboardComponent } from "./../dashboard/dashboard.component";
import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from "@angular/forms";
import { SignupComponent } from "./../login/signup.component";
import { Observable } from "rxjs/Rx";
import { ActivatedRoute } from "@angular/router";
import { MockBackend } from "@angular/http/testing";
import { BaseRequestOptions, Http } from "@angular/http";
import { HomeComponent } from "./home.component";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { Auth } from "../../shared/services/auth/auth.service";
import { JwtEncoder } from "../../shared/services/encoding/jwt.service";
import { ErrorService } from "../../shared/services/error/error.service";

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
