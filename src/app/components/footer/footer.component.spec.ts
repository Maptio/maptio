import { environment } from "./../../../environment/environment";
import { ComponentFixture, async, TestBed } from "@angular/core/testing";
import { FooterComponent } from "./footer.component";
import { NO_ERRORS_SCHEMA } from "@angular/core"
import { ResponsiveModule } from "ng2-responsive";

describe("footer.component.ts", () => {

    let component: FooterComponent;
    let target: ComponentFixture<FooterComponent>;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [FooterComponent],
            imports : [ResponsiveModule],
            schemas : [NO_ERRORS_SCHEMA]
        }).overrideComponent(FooterComponent, {
            set: {
                providers: [
                ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(FooterComponent);

        component = target.componentInstance;
    });

    it("should gets correct links ", () => {
        expect(component.TOS_URL).toBe(environment.TOS_URL);
        expect(component.PRIVACY_URL).toBe(environment.PRIVACY_URL);
        expect(component.BLOG_URL).toBe(environment.BLOG_URL);
    });

});
