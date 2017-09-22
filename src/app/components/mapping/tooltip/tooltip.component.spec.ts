
import { AuthHttp } from "angular2-jwt";
import { UserFactory } from "./../../../shared/services/user.factory";
import { BaseRequestOptions, Http } from "@angular/http";
import { TeamFactory } from "./../../../shared/services/team.factory";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { InitiativeComponent } from "./../../initiative/initiative.component";
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
import { authHttpServiceFactoryTesting } from "../../../../test/specs/shared/authhttp.helper.shared";
import { Auth } from "../../../shared/services/auth/auth.service";

export class AuthStub {

}

describe("tooltip.component.ts", () => {
    let component: TooltipComponent;
    let target: ComponentFixture<TooltipComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                UIService, D3Service, TeamFactory, UserFactory,
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions, Auth]
                },
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                ErrorService,
                { provide: Auth, useClass: AuthStub },

            ],
            declarations: [TooltipComponent, InitiativeComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents()
    }));

    beforeEach(() => {
        target = TestBed.createComponent(TooltipComponent);
        component = target.componentInstance;
        target.detectChanges();
    });

    it("should render the tooltip when initiative is updated", () => {
        let uiService: UIService = target.debugElement.injector.get(UIService);

        let updated = new Initiative();
        let parent = new Initiative();
        updated.name = "UPDATED";
        updated.accountable = new User({ name: "John Doe" });
        updated.description = "The one idea I clicked";
        let spyUiService = spyOn(uiService, "getTooltipData").and.returnValue(Observable.of([updated, parent]));
        component.update();
        target.detectChanges();
        expect(component.node).toBe(updated);
        expect(component.parent).toBe(parent);
        expect(component.isReadOnly).toBe(true)
        expect(spyUiService).toHaveBeenCalledTimes(1);

    });

    it("should stop subscribing to updates when the component is destroyed", () => {
        let spy = spyOn(component.subscription, "unsubscribe");
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalledTimes(1);
    });

});