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
}

fdescribe("home.component.ts", () => {
    let component: HomeComponent;
    let target: ComponentFixture<HomeComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HomeComponent, SignupComponent, DashboardComponent],
            imports: [ReactiveFormsModule, FormsModule, RouterTestingModule, NgbModule.forRoot()]
        }).overrideComponent(HomeComponent, {
            set: {
                providers: [
                    // JwtEncoder,
                    { provide: Auth, useClass: AuthStub },
                    // {
                    //     provide: ActivatedRoute,
                    //     useValue: {
                    //         queryParams: Observable.of({ token: "TOKEN" })
                    //     }
                    // },
                    // {
                    //     provide: Http,
                    //     useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                    //         return new Http(mockBackend, options);
                    //     },
                    //     deps: [MockBackend, BaseRequestOptions]
                    // },
                    // MockBackend,
                    // BaseRequestOptions,
                    // ErrorService
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(HomeComponent);
        component = target.componentInstance;

        // target.detectChanges(); // trigger initial data binding
    });

    it("all dependencies are provided", () => {
        expect(true).toBe(true);
    })
});
