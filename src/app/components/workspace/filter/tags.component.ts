import { Team } from "./../../../shared/model/team.data";
import { SelectableTag, Tag } from "./../../../shared/model/tag.data";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Angulartics2Mixpanel } from "angulartics2";

@Component({
    selector: "filter-tags",
    templateUrl: "./tags.component.html",
    // styleUrls: ["./tags.component.css"]
})
export class FilterTagsComponent implements OnInit {
    @Input() tags: SelectableTag[];
    @Input() team: Team;
    @Output() changeTagsSettings: EventEmitter<SelectableTag[]> = new EventEmitter<SelectableTag[]>();
    @Output() changeTagsSelection: EventEmitter<SelectableTag[]> = new EventEmitter<SelectableTag[]>();


    public newTagForm: FormGroup;
    newTagColor = "#fff";
    isEditTags: boolean;
    constructor(private analytics: Angulartics2Mixpanel) { }

    ngOnInit() {
        this.newTagForm = new FormGroup({
            name: new FormControl("", { validators: [Validators.required], updateOn: "submit" }),
            color: new FormControl(this.newTagColor, { validators: [Validators.required], updateOn: "submit" })
        });
    }

    toggleTag(tag: SelectableTag) {
        tag.isSelected = !tag.isSelected;
        this.changeTagsSelection.emit(this.tags)
    }

    selectAllTags() {
        this.tags.forEach(t => t.isSelected = true);
        this.changeTagsSelection.emit(this.tags)
    }

    unselectAllTags() {
        this.tags.forEach(t => t.isSelected = false);
        this.changeTagsSelection.emit(this.tags)
    }

    saveColor(tag: Tag, color: string) {
        tag.color = color;
        this.changeTagsSettings.emit(this.tags)
    }

    saveTagName(tag: Tag, name: string) {
        tag.name = name;
    }

    saveTagChanges() {
        this.changeTagsSettings.emit(this.tags)
    }

    saveTagColor(color: string) {
        this.newTagColor = color;
    }

    addTag() {
        if (this.newTagForm.dirty && this.newTagForm.valid) {
            let name = this.newTagForm.controls["name"].value;
            let tag = new Tag().create(name, this.newTagColor);

            this.tags.unshift(<SelectableTag>tag);
            this.changeTagsSettings.emit(this.tags)
            this.newTagForm.reset({ name: "", color: this.newTagColor });
            this.analytics.eventTrack("Map", {
                action: "Add tag",
                team: this.team.name,
                teamId: this.team.team_id
            });
        }
    }

    removeTag(tag: Tag) {
        let index = this.tags.findIndex(t => t.shortid === tag.shortid);
        if (index >= 0) {
            this.tags.splice(index, 1);
            this.analytics.eventTrack("Map", {
                action: "Remove tag",
                team: this.team.name,
                teamId: this.team.team_id
            });
        }
        this.changeTagsSettings.emit(this.tags)
    }
}