import { UserFactory } from "./../../shared/services/user.factory";
import { RouterTestingModule } from "@angular/router/testing";
import { Angulartics2Mixpanel, Angulartics2 } from "angulartics2";
import { ActivatedRoute } from "@angular/router";
import { UIService } from "./../..//shared/services/ui/ui.service";
import { ColorService } from "./../..//shared/services/ui/color.service";
import { D3Service } from "d3-ng2-service";
import { Observable } from "rxjs/Observable";
import { ErrorService } from "./../..//shared/services/error/error.service";
import { MockBackend } from "@angular/http/testing";
import { Http, BaseRequestOptions } from "@angular/http";
import { DataService, URIService } from "./../..//shared/services/data.service";
import { MappingTreeComponent } from "./tree/mapping.tree.component";
import { MappingCirclesComponent } from "./circles/mapping.circles.component";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { MappingComponent } from "./mapping.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { IDataVisualizer } from "./mapping.interface";
import { MappingNetworkComponent } from "./network/mapping.network.component";
import { MemberSummaryComponent } from "./member-summary/member-summary.component";
import { Tag, SelectableTag } from "../../shared/model/tag.data";
import { MappingZoomableComponent } from "./zoomable/mapping.zoomable.component";

describe("mapping.component.ts", () => {

    let component: MappingComponent;
    let target: ComponentFixture<MappingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DataService, ErrorService, D3Service, ColorService, UIService, URIService, Angulartics2Mixpanel, Angulartics2,
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
                        fragment: Observable.of(`x=50&y=50&scale=1.2`),
                        snapshot: { fragment: undefined }
                    }
                }

            ],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [MappingComponent, MappingCirclesComponent, MappingTreeComponent,
                MappingNetworkComponent, MemberSummaryComponent, MappingZoomableComponent],
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

        describe("getLayout", () => {
            it("should return initiatives when component is MappingCirclesComponent", () => {
                let actual = component.getLayout(new MappingCirclesComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("initiatives")
            });

            it("should return people when component is MappingTreeComponent", () => {
                let actual = component.getLayout(new MappingTreeComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("people")
            });

            it("should return connections when component is MappingNetworkComponent", () => {
                let actual = component.getLayout(new MappingNetworkComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("connections")
            });

            it("should return list when layout is list", () => {
                let actual = component.getLayout(new MemberSummaryComponent(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("list")
            });
        });



        describe("getFragment", () => {
            it("should return #x=761&y=761&scale=1 when layout is initiatives", () => {
                let actual = component.getFragment(new MappingCirclesComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("x=761&y=761&scale=1")
            });

            it("should return #x=100&y=380.5&scale=1 when layout is people", () => {
                let actual = component.getFragment(new MappingTreeComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("x=100&y=380.5&scale=1")
            });

            it("should return #x=0&y=-380.5&scale=1 when layout is network", () => {
                let actual = component.getFragment(new MappingNetworkComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("x=0&y=-380.5&scale=1")
            });


            it("should return #x=0&y=0&scale=1 when layout is list", () => {
                let actual = component.getFragment(new MemberSummaryComponent(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("x=0&y=0&scale=1")
            });
        });

        describe("isDisplayLockingToggle", () => {
            it("should return true when layout is initiatives", () => {
                component.layout = "initiatives"
                let actual = component.isDisplayLockingToggle();
                expect(actual).toBeTruthy()
            });

            it("should return false when layout is people", () => {
                component.layout = "people"
                let actual = component.isDisplayLockingToggle();
                expect(actual).toBeFalsy()
            });

            it("should return true by default", () => {
                component.layout = ""
                let actual = component.isDisplayLockingToggle();
                expect(actual).toBeTruthy()
            });
        });

        describe("resetZoom", () => {
            it("should reset zoom", () => {
                spyOn(component.isReset$, "next");
                spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
                component.resetZoom();
                expect(component.isReset$.next).toHaveBeenCalledWith(true);
                expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
            });
        });

        describe("change font size", () => {
            it("should chnage font size", () => {
                spyOn(component.fontSize$, "next");
                spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
                component.changeFontSize(12);
                expect(component.fontSize$.next).toHaveBeenCalledWith(12);
                expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
            });
        });

        // describe("lock", () => {
        //     it("should lock", () => {
        //         spyOn(component.isLocked$, "next");
        //         spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
        //         component.lock(true);
        //         expect(component.isLocked$.next).toHaveBeenCalledWith(true);
        //         expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
        //         expect(component.isLocked).toBe(true)
        //     });

        //     it("should unlock", () => {
        //         spyOn(component.isLocked$, "next");
        //         spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
        //         component.lock(false);
        //         expect(component.isLocked$.next).toHaveBeenCalledWith(false);
        //         expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
        //         expect(component.isLocked).toBe(false)
        //     });
        // });

        it("onActivate", () => {
            let activated = <IDataVisualizer>new MappingNetworkComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined)
            spyOn(component, "getFragment").and.returnValue("x=10&y=100&scale=1.3")

            component.onActivate(activated);

            expect(activated.width).toBe(1522)
            expect(activated.height).toBe(1522)
            expect(activated.margin).toBe(50);
            expect(component.getFragment).toHaveBeenCalledTimes(1);
            expect(activated.translateX).toBe(10);
            expect(activated.translateY).toBe(100);
            expect(activated.scale).toBe(1.3);
        })

        describe("Toggling", () => {
            it("toggles settings panel  ", () => {
                component.toggleTagSettingsTab();
                expect(component.isSettingsPanelCollapsed).toBe(false);
                expect(component.isTagSettingActive).toBe(true);
                expect(component.isMapSettingActive).toBe(false);
            });

            it("toggles tags editing panel", () => {
                component.togglePanel();
                expect(component.isSettingsPanelCollapsed).toBe(false);
                expect(component.isTagSettingActive).toBe(false);
                expect(component.isMapSettingActive).toBe(true);
            });
        });

        describe("Tagging", () => {
            describe("Saving ", () => {
                it("should save color and send event to apply to dataset", () => {
                    let spy = spyOn(component.applySettings, "emit");
                    let tag = new Tag({ name: "tag", color: "red" });
                    component.saveColor(tag, "#fff");
                    expect(tag.color).toBe("#fff");
                    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
                        initiative: component.initiative,
                        tags: component.tags
                    }))
                });

                it("should save name and send event to apply to dataset", () => {
                    let spy = spyOn(component.applySettings, "emit");
                    let tag = new Tag({ name: "tag", color: "red" });
                    component.saveTagName(tag, "new name");
                    expect(tag.name).toBe("new name");
                    expect(spy).not.toHaveBeenCalledWith(jasmine.objectContaining({
                        initiative: component.initiative,
                        tags: component.tags
                    }))
                });

                it("should send event to apply to dataset", () => {
                    let spy = spyOn(component.applySettings, "emit");
                    component.saveTagChanges();
                    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
                        initiative: component.initiative,
                        tags: component.tags
                    }))
                });
            });
            describe("Adding", () => {
                it("should do nothing if form is invalid", () => {
                    component.newTagForm.setValue({ name: "", color: "" });
                    let spy = spyOn(component.applySettings, "emit")
                    component.addTag();
                    expect(spy).not.toHaveBeenCalled();
                });

                it("should add tag if form is valid and reset form", () => {
                    component.tags = [new SelectableTag({ name: "first" }), new SelectableTag({ name: "second" })]
                    component.newTagForm.setValue({ name: "new", color: "irrelevant" });
                    component.newTagForm.markAsDirty();
                    component.newTagColor = "blue"
                    spyOn(component.applySettings, "emit");
                    spyOn(component.newTagForm, "reset")
                    component.addTag();
                    expect(component.applySettings.emit).toHaveBeenCalledWith(jasmine.objectContaining({
                        initiative: component.initiative,
                        tags: component.tags
                    }));
                    expect(component.tags.length).toBe(3);
                    expect(component.tags[0].name).toBe("new")
                    expect(component.tags[0].color).toBe("blue");
                    expect(component.newTagForm.reset).toHaveBeenCalled();
                });
            });

            describe("Removing tag", () => {
                it("should remove tag when it exits", () => {
                    component.tags = [
                        new SelectableTag({ name: "first", shortid: "1" }),
                        new SelectableTag({ name: "second", shortid: "2" }),
                        new SelectableTag({ name: "three", shortid: "3" })]
                    spyOn(component.applySettings, "emit");

                    component.removeTag(new Tag({ shortid: "2" }));
                    expect(component.tags.length).toBe(2);
                    expect(component.tags[0].shortid).toBe("1")
                    expect(component.tags[1].shortid).toBe("3")
                    expect(component.applySettings.emit).toHaveBeenCalledWith(jasmine.objectContaining({
                        initiative: component.initiative,
                        tags: component.tags
                    }));

                });

                it("should not throw if tag doesnt exist", () => {
                    component.tags = [
                        new SelectableTag({ name: "first", shortid: "1" }),
                        new SelectableTag({ name: "second", shortid: "2" }),
                        new SelectableTag({ name: "three", shortid: "3" })]
                    spyOn(component.applySettings, "emit");

                    component.removeTag(new Tag({ shortid: "4" }));
                    expect(component.tags.length).toBe(3);
                    expect(component.tags[0].shortid).toBe("1")
                    expect(component.tags[1].shortid).toBe("2")
                    expect(component.tags[2].shortid).toBe("3")
                    expect(component.applySettings.emit).toHaveBeenCalledWith(jasmine.objectContaining({
                        initiative: component.initiative,
                        tags: component.tags
                    }));
                });
            });


        });

    });
});