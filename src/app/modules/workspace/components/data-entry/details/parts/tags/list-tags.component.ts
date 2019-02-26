import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tag } from '../../../../../../../shared/model/tag.data';

@Component({
    selector: 'initiative-list-tags',
    templateUrl: './list-tags.component.html',
    // styleUrls: ['./list-tags.component.css']
})
export class InitiativeListTagsComponent implements OnInit {

    @Input("available") availableTags : Array<Tag>;
    @Input("selected") selectedTags : Array<Tag>;
    @Input("isEditMode") isEditMode:boolean;

    @Output("save") save:EventEmitter<Array<Tag>> = new EventEmitter<Array<Tag>>()
    @Output("open") open:EventEmitter<void> = new EventEmitter<void>()

    constructor() { }

    ngOnInit(): void { }

    removeTag(tag: Tag) {
        let index = this.selectedTags.findIndex(t => t.shortid === tag.shortid);
        this.selectedTags.splice(index, 1);
        this.save.emit(this.selectedTags)
    }

    addTag(newTag: Tag) {
        if (this.selectedTags.findIndex(t => t.shortid === newTag.shortid) < 0) {
            this.selectedTags.unshift(new Tag(newTag));
        }
        this.save.emit(this.selectedTags);
    }

    editTags(){
        this.open.emit();
    }
}
