import { FilterTagsComponent } from "./tags.component";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";
import { Team } from "../../../../shared/model/team.data";
import { SelectableTag } from "../../../../shared/model/tag.data";
import { AnalyticsModule } from "../../../../core/analytics.module";


describe("tags.component.ts", () => {

    let component: FilterTagsComponent;
    let target: ComponentFixture<FilterTagsComponent>;

    beforeEach(waitForAsync(() => {

        TestBed.configureTestingModule({
            declarations: [FilterTagsComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [RouterTestingModule, AnalyticsModule]
        }).overrideComponent(FilterTagsComponent, {
            set: {
                // providers: [
                //     Angulartics2Mixpanel
                // ]
            }
        }).compileComponents();
    }));

    beforeEach(() => {
        target = TestBed.createComponent(FilterTagsComponent);

        component = target.componentInstance;
        component.tags = [];
        component.team = new Team({name: "Team", team_id: "1"})
        target.detectChanges();
    });

    // describe("Saving ", () => {
    //     it("should save color and send event to apply to dataset", () => {
    //         let spy = spyOn(component.changeTagsSettings, "emit");
    //         let tag = new Tag({ name: "tag", color: "red" });
    //         component.saveColor(tag, "#fff");
    //         expect(tag.color).toBe("#fff");
    //         expect(spy).toHaveBeenCalledWith(component.tags);
    //     });

    //     it("should save name and send event to apply to dataset", () => {
    //         let spy = spyOn(component.changeTagsSettings, "emit");
    //         let tag = new Tag({ name: "tag", color: "red" });
    //         component.saveTagName(tag, "new name");
    //         expect(tag.name).toBe("new name");
    //         expect(spy).not.toHaveBeenCalledWith(component.tags);
    //     });

    //     it("should send event to apply to dataset", () => {
    //         let spy = spyOn(component.changeTagsSettings, "emit");
    //         component.saveTagChanges();
    //         expect(spy).toHaveBeenCalledWith(component.tags);
    //     });
    // });


    // describe("Adding", () => {
    //     it("should do nothing if form is invalid", () => {
    //         component.newTagForm.setValue({ name: "", color: "" });
    //         let spy = spyOn(component.changeTagsSettings, "emit")
    //         component.addTag();
    //         expect(spy).not.toHaveBeenCalled();
    //     });

    //     it("should add tag if form is valid and reset form", () => {
    //         component.tags = [new SelectableTag({ name: "first" }), new SelectableTag({ name: "second" })]
    //         component.newTagForm.setValue({ name: "new", color: "irrelevant" });
    //         component.newTagForm.markAsDirty();
    //         component.newTagColor = "blue"
    //         spyOn(component.changeTagsSettings, "emit");
    //         spyOn(component.newTagForm, "reset")
    //         component.addTag();
    //         expect(component.changeTagsSettings.emit).toHaveBeenCalledWith(component.tags);
    //         expect(component.tags.length).toBe(3);
    //         expect(component.tags[0].name).toBe("new")
    //         expect(component.tags[0].color).toBe("blue");
    //         expect(component.newTagForm.reset).toHaveBeenCalled();
    //     });
    // });

    // describe("Removing tag", () => {
    //     it("should remove tag when it exits", () => {
    //         component.tags = [
    //             new SelectableTag({ name: "first", shortid: "1" }),
    //             new SelectableTag({ name: "second", shortid: "2" }),
    //             new SelectableTag({ name: "three", shortid: "3" })]
    //         spyOn(component.changeTagsSettings, "emit");

    //         component.removeTag(new Tag({ shortid: "2" }));
    //         expect(component.tags.length).toBe(2);
    //         expect(component.tags[0].shortid).toBe("1")
    //         expect(component.tags[1].shortid).toBe("3")
    //         expect(component.changeTagsSettings.emit).toHaveBeenCalledWith(component.tags);

    //     });

    //     it("should not throw if tag doesnt exist", () => {
    //         component.tags = [
    //             new SelectableTag({ name: "first", shortid: "1" }),
    //             new SelectableTag({ name: "second", shortid: "2" }),
    //             new SelectableTag({ name: "three", shortid: "3" })]
    //         spyOn(component.changeTagsSettings, "emit");

    //         component.removeTag(new Tag({ shortid: "4" }));
    //         expect(component.tags.length).toBe(3);
    //         expect(component.tags[0].shortid).toBe("1")
    //         expect(component.tags[1].shortid).toBe("2")
    //         expect(component.tags[2].shortid).toBe("3")
    //         expect(component.changeTagsSettings.emit).toHaveBeenCalledWith(component.tags);
    //     });
    // });

    describe("Selecting Tag", () => {
        it("should selectAll and broadcat changes", () => {
            spyOn(component.changeTagsSelection, "emit");
            component.tags = [
                new SelectableTag({ name: "one", isSelected: true }),
                new SelectableTag({ name: "two", isSelected: false }),
                new SelectableTag({ name: "three", isSelected: true })
            ]

            component.selectAllTags();
            expect(component.tags.every(t => t.isSelected)).toBeTruthy();
            expect(component.changeTagsSelection.emit).toHaveBeenCalledWith(component.tags);
        });

        it("should unselectAll and braodcast changes", () => {
            spyOn(component.changeTagsSelection, "emit");
            component.tags = [
                new SelectableTag({ name: "one", isSelected: true }),
                new SelectableTag({ name: "two", isSelected: false }),
                new SelectableTag({ name: "three", isSelected: true })
            ]

            component.unselectAllTags();
            expect(component.tags.every(t => !t.isSelected)).toBeTruthy();
            expect(component.changeTagsSelection.emit).toHaveBeenCalledWith(component.tags);
        });

        it("should toggleTag and braodcast changes", () => {
            spyOn(component.changeTagsSelection, "emit");
            component.tags = [
                new SelectableTag({ name: "one", isSelected: true }),
                new SelectableTag({ name: "two", isSelected: false }),
                new SelectableTag({ name: "three", isSelected: true })
            ]

            component.toggleTag(component.tags[1]);
            expect(component.tags[1].isSelected).toBeTruthy();
            expect(component.changeTagsSelection.emit).toHaveBeenCalledWith(component.tags);
        });
    });



});