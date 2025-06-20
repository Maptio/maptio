import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tag } from '../../../../../../../shared/model/tag.data';
import { StickyPopoverDirective } from '../../../../../../../shared/directives/sticky.directive';
import { NgIf, NgFor } from '@angular/common';
import { InsufficientPermissionsMessageComponent } from '../../../../../../permissions-messages/insufficient-permissions-message.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'initiative-list-tags',
    templateUrl: './list-tags.component.html',
    imports: [
        NgIf,
        NgFor,
        NgbDropdownModule,
        StickyPopoverDirective,
        InsufficientPermissionsMessageComponent,
    ]
})
export class InitiativeListTagsComponent implements OnInit {
  @Input('available') availableTags: Array<Tag>;
  @Input('selected') selectedTags: Array<Tag>;
  @Input('isEditMode') isEditMode: boolean;
  @Input('isUnauthorized') isUnauthorized: boolean;

  @Output('save') save: EventEmitter<Array<Tag>> = new EventEmitter<
    Array<Tag>
  >();
  @Output('open') open: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  removeTag(tag: Tag) {
    const index = this.selectedTags.findIndex((t) => t.shortid === tag.shortid);
    this.selectedTags.splice(index, 1);
    this.save.emit(this.selectedTags);
  }

  addTag(newTag: Tag) {
    if (this.selectedTags.findIndex((t) => t.shortid === newTag.shortid) < 0) {
      this.selectedTags.unshift(new Tag(newTag));
    }
    this.save.emit(this.selectedTags);
  }

  editTags() {
    this.open.emit();
  }
}
