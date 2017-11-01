import { UserFactory } from "./../../shared/services/user.factory";
// import { MappingNetworkComponent } from "./network/mapping.network.component";
import { RouterTestingModule } from "@angular/router/testing";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import { Initiative } from "./../../shared/model/initiative.data";
import { ActivatedRoute, Params, Router, NavigationStart } from "@angular/router";
// import { TooltipComponent } from "./tooltip/tooltip.component";
import { UIService } from "./../..//shared/services/ui/ui.service";
import { ColorService } from "./../..//shared/services/ui/color.service";
import { D3Service } from "d3-ng2-service";
import { AnchorDirective } from "./../..//shared/directives/anchor.directive";
import { Observable } from "rxjs/Observable";
import { ErrorService } from "./../..//shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { DataService } from "./../..//shared/services/data.service";
import { MappingTreeComponent } from "./tree/mapping.tree.component";
import { MappingCirclesComponent } from "./circles/mapping.circles.component";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { MappingComponent } from "./mapping.component";
import { Views } from "../../shared/model/view.enum";
import { ComponentFactoryResolver, ComponentFactory, ComponentRef, Type, NO_ERRORS_SCHEMA } from "@angular/core";
import { AuthHttp, AuthConfig } from "angular2-jwt/angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { UserService } from "../../shared/services/user/user.service";
import { JwtEncoder } from "../../shared/services/encoding/jwt.service";
import { IDataVisualizer } from "./mapping.interface";
import { Subject } from "rxjs/Rx";

describe("mapping.component.ts", () => {

    let component: MappingComponent;
    let target: ComponentFixture<MappingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DataService, ErrorService, D3Service, ColorService, UIService, Angulartics2Mixpanel, Angulartics2,
                UserFactory,
                {
                    provide: Http,
                    useFactory: (mockBackend: MockBackend, options: BaseRequestOptions) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                {
                    provide: AuthHttp,
                    useFactory: authHttpServiceFactoryTesting,
                    deps: [Http, BaseRequestOptions]
                }
                ,
                BaseRequestOptions,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: Observable.of({ mapid: 123, layout: "initiatives" }),
                        fragment: Observable.of(`x=50&y=50&scale=1.2`)
                    }
                }

            ],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [MappingComponent, MappingCirclesComponent, MappingTreeComponent, AnchorDirective],
            imports: [RouterTestingModule]
        })
            .compileComponents()

    }));

    beforeEach(() => {
        target = TestBed.createComponent(MappingComponent);
        component = target.componentInstance;

        target.detectChanges(); // trigger initial data binding
    });

    describe("Controller", () => {

        describe("zoomIn", () => {
            it("should set the zoom factor to 1.1", async(() => {
                let spy = spyOn(component.zoom$, "next");
                component.zoomIn();
                expect(spy).toHaveBeenCalledWith(1.1)
            }));
        });

        describe("zoomOut", () => {
            it("should set the zoom factor to 1.1", async(() => {
                let spy = spyOn(component.zoom$, "next");
                component.zoomOut();
                expect(spy).toHaveBeenCalledWith(0.9)
            }));
        });

        describe("getComponentFactory", () => {
            it("should return MappingCirclesComponent if layout is initiatives", () => {
                let actual = component.getComponentFactory("initiatives");
                expect(actual.componentType.name).toBe("MappingCirclesComponent")
            });

            it("should return MappingTreeComponent if layout is people", () => {
                let actual = component.getComponentFactory("people");
                expect(actual.componentType.name).toBe("MappingTreeComponent")
            });

            // it("should return MappingNetworkComponent if layout is network", () => {
            //     let actual = component.getComponentFactory("network");
            //     expect(actual.componentType.name).toBe("MappingNetworkComponent")
            // });

            it("should return MappingCirclesComponent if layout is empty", () => {
                let actual = component.getComponentFactory("");
                expect(actual.componentType.name).toBe("MappingCirclesComponent")
            });
        });

        describe("getFragment", () => {
            it("should return #x=761&y=761&scale=1 when layout is initiatives", () => {
                let actual = component.getFragment("initiatives");
                expect(actual).toBe("x=761&y=761&scale=1")
            });

            it("should return #x=100&y=0&scale=1 when layout is people", () => {
                let actual = component.getFragment("people");
                expect(actual).toBe("x=100&y=0&scale=1")
            });

            it("should return #x=761&y=761&scale=1 by default", () => {
                let actual = component.getFragment("notlayout");
                expect(actual).toBe("x=761&y=761&scale=1")
            });
        });

    

    });
});