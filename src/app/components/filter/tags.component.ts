import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { URIService } from "../../shared/services/uri.service";
import { SelectableTag, Tag } from "../../shared/model/tag.data";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Angulartics2Mixpanel } from "angulartics2";
import { Team } from "../../shared/model/team.data";

@Component({
    selector: "filter-tags",
    templateUrl: "./tags.component.html",
    // styleUrls: ["./tags.component.css"]
})
export class FilterTagsComponent implements OnInit {
    @Input() tags: SelectableTag[];
    @Input() team: Team;
    @Output() changeTags: EventEmitter<SelectableTag[]> = new EventEmitter<SelectableTag[]>();


    public newTagForm: FormGroup;
    newTagColor = "#fff";
    isEditTags:boolean;
    constructor(private analytics: Angulartics2Mixpanel) { }

    ngOnInit() {
        this.newTagForm = new FormGroup({
            name: new FormControl("", [Validators.required]),
            color: new FormControl(this.newTagColor, [Validators.required])
        });
    }

    toggleTag(tag: SelectableTag) {
        tag.isSelected = !tag.isSelected;
        // this.broadcastTagsSelection();
        this.changeTags.emit(this.tags)
    }

    selectAllTags() {
        this.tags.forEach(t => t.isSelected = true);
        // this.broadcastTagsSelection();
        this.changeTags.emit(this.tags)
    }

    unselectAllTags() {
        this.tags.forEach(t => t.isSelected = false);
        this.changeTags.emit(this.tags)
        // this.broadcastTagsSelection();
    }

    saveColor(tag: Tag, color: string) {
        tag.color = color;
        this.changeTags.emit(this.tags)
        // this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
    }

    saveTagName(tag: Tag, name: string) {
        tag.name = name;
        // this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
    }

    saveTagChanges() {
        this.changeTags.emit(this.tags)
        // this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
    }

    addTag() {
        if (this.newTagForm.dirty && this.newTagForm.valid) {
            let name = this.newTagForm.controls["name"].value;
            let tag = new Tag().create(name, this.newTagColor);

            this.tags.unshift(<SelectableTag>tag);
            this.changeTags.emit(this.tags)
            // this.applySettings.emit({ initiative: this.initiative, tags: this.tags });
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
        this.changeTags.emit(this.tags)
        // this.applySettings.emit({ initiative: this.initiative, tagss: this.tags });
    }
}