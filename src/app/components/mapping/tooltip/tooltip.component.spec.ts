import { Person } from './../../../shared/model/person.data';
import { Initiative } from './../../../shared/model/initiative.data';
import { Observable } from 'rxjs/Rx';
import { D3Service } from "d3-ng2-service";
import { UIService } from "./../../../shared/services/ui.service";
import { TestBed, ComponentFixture, async } from "@angular/core/testing";
import { TooltipComponent } from "./tooltip.component";
import { By } from "@angular/platform-browser";

describe("tooltip.component.ts", () => {
    let component: TooltipComponent;
    let target: ComponentFixture<TooltipComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                UIService, D3Service
            ],
            declarations: [TooltipComponent]
        })
            .compileComponents()
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TooltipComponent);
        component = target.componentInstance;
        target.detectChanges(); // trigger initial data binding
    });

    it("should update the initiative when initiative is updated", () => {
        let uiService: UIService = target.debugElement.injector.get(UIService);

        let updated = new Initiative();
        updated.name = "UPDATED"
        let spyUiService = spyOn(uiService, "getTooltipData").and.returnValue(Observable.of(updated));

        expect(component.initiative).toBeUndefined();
        component.update();
        expect(spyUiService).toHaveBeenCalledTimes(1);
        expect(component.initiative).toBe(updated);
    });

    it("should render nothing at first load", () => {
        target.detectChanges();
        let elements = target.debugElement.queryAll(By.css(".well"));
        expect(elements.length).toBe(0);
    });

    it("should render the tooltip when initiative is updated", () => {
        let uiService: UIService = target.debugElement.injector.get(UIService);

        let updated = new Initiative();
        updated.name = "UPDATED";
        updated.accountable = new Person({ name: "John Doe" });
        updated.description = "The one idea I clicked";
        let spyUiService = spyOn(uiService, "getTooltipData").and.returnValue(Observable.of(updated));

        component.update();
        target.detectChanges();
        expect(spyUiService).toHaveBeenCalledTimes(1);
        let elements = target.debugElement.queryAll(By.css(".well"));
        expect(elements.length).toBe(1);
        expect(elements[0].query(By.css(".name")).nativeElement.textContent).toContain(updated.name);
        expect(elements[0].query(By.css(".accountable")).nativeElement.textContent).toContain(updated.accountable.name);
        expect(elements[0].query(By.css(".description")).nativeElement.textContent).toContain(updated.description);

    });

    it("should stop subscribing to updates when the component is destroyed", () => {
        let spy = spyOn(component.subscription,"unsubscribe");
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalledTimes(1);
    });

});