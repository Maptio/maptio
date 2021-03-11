import { Team } from "../../../../shared/model/team.data";
import { SelectableTag, Tag } from "../../../../shared/model/tag.data";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Angulartics2Mixpanel } from "angulartics2/mixpanel";

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


   constructor(private analytics: Angulartics2Mixpanel) { }

    ngOnInit() {
        
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

}