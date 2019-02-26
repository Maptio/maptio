import { HomeComponent } from "./home.page";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { DashboardComponent } from "../../components/dashboard/dashboard.component";
import { RouterTestingModule } from "@angular/router/testing";
import { SanitizerModule } from "../../../../shared/sanitizer.module";
import { ReactiveFormsModule } from "@angular/forms";
import { PermissionsModule } from "../../../../shared/permissions.module";
import { CreateMapModule } from "../../../../shared/create-map.module";
import { OnboardingModule } from "../../../../shared/onboarding.module";
import { CoreModule } from "../../../../core/core.module";
import { AnalyticsModule } from "../../../../core/analytics.module";
import { HomeModule } from "../../home.module";
import { SharedModule } from "../../../../shared/shared.module";

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
            imports : [ReactiveFormsModule,RouterTestingModule,CreateMapModule,
                CoreModule, SharedModule.forRoot(), AnalyticsModule, PermissionsModule, SanitizerModule],
            declarations: [HomeComponent, DashboardComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(HomeComponent);
        component = target.componentInstance;

        target.detectChanges();

    });

    it('should create component', () => {
        expect(component).toBeDefined()
    });
});
