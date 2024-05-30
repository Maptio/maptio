import { environment } from '../../../../../config/environment';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Tag, SelectableTag } from '../../../../../shared/model/tag.data';
import {
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Team } from '../../../../../shared/model/team.data';
import { Permissions } from '../../../../../shared/model/permission.data';
import { StickyPopoverDirective } from '../../../../../shared/directives/sticky.directive';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { NgIf, NgFor } from '@angular/common';
import { ColorPickerComponent } from '../../../../../shared/components/color-picker/color-picker.component';
import { PermissionsDirective } from '../../../../../shared/directives/permission.directive';
import { InsufficientPermissionsMessageComponent } from '../../../../permissions-messages/insufficient-permissions-message.component';

@Component({
  selector: 'edit-tags',
  templateUrl: './edit-tags.component.html',
  styleUrls: ['./edit-tags.component.css'],
  standalone: true,
  imports: [
    InsufficientPermissionsMessageComponent,
    PermissionsDirective,
    FormsModule,
    ReactiveFormsModule,
    ColorPickerComponent,
    NgIf,
    NgFor,
    ConfirmationPopoverModule,
    StickyPopoverDirective,
  ],
})
export class EditTagsComponent implements OnInit {
  @Input() tags: SelectableTag[];
  @Input() team: Team;
  @Output('edit') edit: EventEmitter<SelectableTag[]> = new EventEmitter<
    SelectableTag[]
  >();

  Permissions = Permissions;

  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;
  KB_URL_TAGS = environment.KB_URL_TAGS;

  public newTagForm: UntypedFormGroup;
  public newTagColor = '#aaa';
  public isEditTags: boolean;

  constructor() {}

  ngOnInit(): void {
    this.newTagForm = new UntypedFormGroup({
      name: new UntypedFormControl('', {
        validators: [Validators.required],
        updateOn: 'submit',
      }),
      color: new UntypedFormControl(this.newTagColor, {
        validators: [Validators.required],
        updateOn: 'submit',
      }),
    });
  }

  saveColor(tag: Tag, color: string) {
    tag.color = color;
    this.edit.emit(this.tags);
  }

  saveTagName(tag: Tag, name: string) {
    tag.name = name;
  }

  saveTagChanges() {
    this.edit.emit(this.tags);
  }

  saveTagColor(color: string) {
    this.newTagColor = color;
  }

  addTag() {
    if (this.newTagForm.dirty && this.newTagForm.valid) {
      const name = this.newTagForm.controls['name'].value;
      const tag = new Tag().create(name, this.newTagColor);

      this.tags.unshift(<SelectableTag>tag);
      this.edit.emit(this.tags);
      this.newTagForm.reset({ name: '', color: this.newTagColor });
    }
  }

  removeTag(tag: Tag) {
    const index = this.tags.findIndex((t) => t.shortid === tag.shortid);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    this.edit.emit(this.tags);
  }
}
