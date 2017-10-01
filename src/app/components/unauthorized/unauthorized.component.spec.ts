import { UnauthorizedComponent } from "./unauthorized.component";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";

describe("unauthorized.component.ts", () => {

    let component: UnauthorizedComponent;
    let target: ComponentFixture<UnauthorizedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UnauthorizedComponent]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(UnauthorizedComponent);
        component = target.componentInstance;

        target.detectChanges(); // trigger initial data binding
    });

    it("should create component", () => {
        expect(component instanceof UnauthorizedComponent).toBeTruthy()
    });

});
