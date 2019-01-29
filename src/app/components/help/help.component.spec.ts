import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { DebugElement } from "@angular/core"
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { HelpComponent } from "./help.component";

describe("help.component.ts", () => {

    let component: HelpComponent;
    let target: ComponentFixture<HelpComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [HelpComponent]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(HelpComponent);
        component = target.componentInstance;
        de = target.debugElement.query(By.css("modal"));
        el = de.nativeElement;

        target.detectChanges(); // trigger initial data binding
    });



});
