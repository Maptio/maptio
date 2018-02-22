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
import { DataService } from "./../..//shared/services/data.service";
import { URIService } from "./../..//shared/services/uri.service";
import { MappingTreeComponent } from "./tree/mapping.tree.component";
// import { MappingCirclesComponent } from "./circles/mapping.circles.component";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { MappingComponent } from "./mapping.component";
import { NO_ERRORS_SCHEMA, ChangeDetectorRef } from "@angular/core";
import { AuthHttp } from "angular2-jwt/angular2-jwt";
import { authHttpServiceFactoryTesting } from "../../../test/specs/shared/authhttp.helper.shared";
import { IDataVisualizer } from "./mapping.interface";
import { MappingNetworkComponent } from "./network/mapping.network.component";
import { MemberSummaryComponent } from "./member-summary/member-summary.component";
import { Tag, SelectableTag } from "../../shared/model/tag.data";
import { MappingZoomableComponent } from "./zoomable/mapping.zoomable.component";
import { MarkdownService } from "angular2-markdown";
import { Initiative } from "../../shared/model/initiative.data";

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
                MarkdownService,
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
            declarations: [MappingComponent, MappingTreeComponent,
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

        describe("getFragment", () => {
            it("should return correct fragment  when layout is initiatives", () => {
                let actual = component.getFragment(new MappingZoomableComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe(`x=${component.VIEWPORT_WIDTH / 2}&y=${component.VIEWPORT_WIDTH / 2 - 180}&scale=1`)
            });

            it("should return correct fragment when layout is people", () => {
                let actual = component.getFragment(new MappingTreeComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe(`x=${component.VIEWPORT_WIDTH / 10}&y=${component.VIEWPORT_HEIGHT / 2}&scale=1`)
            });

            it("should return correct fragment when layout is network", () => {
                let actual = component.getFragment(new MappingNetworkComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe(`x=0&y=${-component.VIEWPORT_HEIGHT / 4}&scale=1`)
            });

            it("should return correct fragment  when layout is list", () => {
                let actual = component.getFragment(new MemberSummaryComponent(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                expect(actual).toBe("x=0&y=0&scale=1")
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

        describe("change font color", () => {
            it("should change font color", () => {
                spyOn(component.fontColor$, "next");
                spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
                component.changeFontColor("color")
                expect(component.fontColor$.next).toHaveBeenCalledWith("color");
                expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
            });
        });


        describe("change map color", () => {
            it("should change map color", () => {
                spyOn(component.mapColor$, "next");
                spyOn(target.debugElement.injector.get(Angulartics2Mixpanel), "eventTrack")
                component.changeMapColor("color")
                expect(component.mapColor$.next).toHaveBeenCalledWith("color");
                expect(target.debugElement.injector.get(Angulartics2Mixpanel).eventTrack).toHaveBeenCalled();
            });
        });

        describe("Searching", () => {
            it("should zoom on selected initiative", () => {
                spyOn(component.zoomToInitiative$, "next")
                component.zoomToInitiative(new Initiative());
                expect(component.zoomToInitiative$.next).toHaveBeenCalled();
            });
        });

        it("onActivate", () => {
            let activated = <IDataVisualizer>new MappingNetworkComponent(new D3Service(), undefined, undefined, undefined, undefined, undefined, undefined)
            spyOn(component, "getFragment").and.returnValue("x=10&y=100&scale=1.3")

            component.onActivate(activated);

            expect(activated.width).toBe(window.screen.availWidth)
            expect(activated.height).toBe(window.screen.availHeight)
            expect(activated.margin).toBe(50);
            expect(component.getFragment).toHaveBeenCalledTimes(1);
            expect(activated.translateX).toBe(10);
            expect(activated.translateY).toBe(100);
            expect(activated.scale).toBe(1.3);
        })

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

            describe("Selecting Tag", () => {
                it("should selectAll and broadcat changes", () => {
                    spyOn(component, "broadcastTagsSelection");
                    component.tags = [
                        new SelectableTag({ name: "one", isSelected: true }),
                        new SelectableTag({ name: "two", isSelected: false }),
                        new SelectableTag({ name: "three", isSelected: true })
                    ]

                    component.selectAllTags();
                    expect(component.tags.every(t => t.isSelected)).toBeTruthy();
                    expect(component.broadcastTagsSelection).toHaveBeenCalled();
                });

                it("should unselectAll and braodcast changes", () => {
                    spyOn(component, "broadcastTagsSelection");
                    component.tags = [
                        new SelectableTag({ name: "one", isSelected: true }),
                        new SelectableTag({ name: "two", isSelected: false }),
                        new SelectableTag({ name: "three", isSelected: true })
                    ]

                    component.unselectAllTags();
                    expect(component.tags.every(t => !t.isSelected)).toBeTruthy();
                    expect(component.broadcastTagsSelection).toHaveBeenCalled();
                });

                it("should toggleTag and braodcast changes", () => {
                    spyOn(component, "broadcastTagsSelection");
                    component.tags = [
                        new SelectableTag({ name: "one", isSelected: true }),
                        new SelectableTag({ name: "two", isSelected: false }),
                        new SelectableTag({ name: "three", isSelected: true })
                    ]

                    component.toggleTag(component.tags[1]);
                    expect(component.tags[1].isSelected).toBeTruthy();
                    expect(component.broadcastTagsSelection).toHaveBeenCalled();
                });
            });


        });

    });
});