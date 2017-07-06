import { BaseRequestOptions, Http } from '@angular/http';
import { TeamFactory } from './../../../shared/services/team.factory';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { InitiativeComponent } from './../../initiative/initiative.component';
import { User } from "./../../../shared/model/user.data";
import { Initiative } from "./../../../shared/model/initiative.data";
import { Observable } from "rxjs/Rx";
import { D3Service } from "d3-ng2-service";
import { UIService } from "./../../../shared/services/ui/ui.service";
import { TestBed, ComponentFixture, async } from "@angular/core/testing";
import { TooltipComponent } from "./tooltip.component";
import { By } from "@angular/platform-browser";
import { MockBackend } from "@angular/http/testing";
import { ErrorService } from "../../../shared/services/error/error.service";

describe("tooltip.component.ts", () => {
    let component: TooltipComponent;
    let target: ComponentFixture<TooltipComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                UIService, D3Service, TeamFactory,
                 {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService
            ],
            declarations: [TooltipComponent, InitiativeComponent],
            schemas: [NO_ERRORS_SCHEMA]
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

        expect(component.initiativeEditComponent.initiative).toBeUndefined();
        component.update();
        expect(spyUiService).toHaveBeenCalledTimes(1);
        expect(component.initiativeEditComponent.initiative).toBe(updated);
    });

    // it("should render at first load", () => {
    //     target.detectChanges();
    //     let elements = target.debugElement.queryAll(By.css(".well"));
    //     expect(elements.length).toBe(1);
    // });

    it("should render the tooltip when initiative is updated", () => {
        let uiService: UIService = target.debugElement.injector.get(UIService);

        let updated = new Initiative();
        updated.name = "UPDATED";
        updated.accountable = new User({ name: "John Doe" });
        updated.description = "The one idea I clicked";
        let spyUiService = spyOn(uiService, "getTooltipData").and.returnValue(Observable.of(updated));
        let spyInitiativeComponent = spyOn(component.initiativeEditComponent, "ngOnInit")
        component.update();
        target.detectChanges();
        expect(spyUiService).toHaveBeenCalledTimes(1);
        expect(spyInitiativeComponent).toHaveBeenCalledTimes(1)
        // let elements = target.debugElement.queryAll(By.css(".well"));
        // expect(elements.length).toBe(1);
        // expect(elements[0].query(By.css(".name")).nativeElement.textContent).toContain(updated.name);
        // expect(elements[0].query(By.css(".accountable")).nativeElement.textContent).toContain(updated.accountable.name);
        // expect(elements[0].query(By.css(".description")).nativeElement.textContent).toContain(updated.description);

    });

    it("should stop subscribing to updates when the component is destroyed", () => {
        let spy = spyOn(component.subscription, "unsubscribe");
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalledTimes(1);
    });

});