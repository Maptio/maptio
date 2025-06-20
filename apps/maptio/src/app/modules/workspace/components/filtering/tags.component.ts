import { Team } from '../../../../shared/model/team.data';
import { SelectableTag, Tag } from '../../../../shared/model/tag.data';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'filter-tags',
    templateUrl: './tags.component.html',
    imports: [NgIf, NgFor, RouterLink]
})
export class FilterTagsComponent implements OnInit {
  @Input() isFilterDisabled: boolean;
  @Input() expandedMapLink: string;
  @Input() tags: SelectableTag[];
  @Input() team: Team;
  @Output() changeTagsSettings: EventEmitter<SelectableTag[]> =
    new EventEmitter<SelectableTag[]>();
  @Output() changeTagsSelection: EventEmitter<SelectableTag[]> =
    new EventEmitter<SelectableTag[]>();

  constructor() {}

  ngOnInit() {}

  toggleTag(tag: SelectableTag) {
    tag.isSelected = !tag.isSelected;
    this.changeTagsSelection.emit(this.tags);
  }

  selectAllTags() {
    this.tags.forEach((t) => (t.isSelected = true));
    this.changeTagsSelection.emit(this.tags);
  }

  unselectAllTags() {
    this.tags.forEach((t) => (t.isSelected = false));
    this.changeTagsSelection.emit(this.tags);
  }
}
