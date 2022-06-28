import { environment } from '../../../../../config/environment';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Tag, SelectableTag } from '../../../../../shared/model/tag.data';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { Team } from '../../../../../shared/model/team.data';
import { Permissions } from '../../../../../shared/model/permission.data';

@Component({
  selector: 'edit-tags',
  templateUrl: './edit-tags.component.html',
  styleUrls: ['./edit-tags.component.css'],
})
export class EditTagsComponent implements OnInit {
  @Input() tags: SelectableTag[];
  @Input() team: Team;
  @Output('edit') edit: EventEmitter<SelectableTag[]> = new EventEmitter<
    SelectableTag[]
  >();

  Permissions = Permissions;

  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

  public newTagForm: FormGroup;
  public newTagColor = '#aaa';
  public isEditTags: boolean;

  constructor(private analytics: Angulartics2Mixpanel) {}

  ngOnInit(): void {
    this.newTagForm = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required],
        updateOn: 'submit',
      }),
      color: new FormControl(this.newTagColor, {
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
      let name = this.newTagForm.controls['name'].value;
      let tag = new Tag().create(name, this.newTagColor);

      this.tags.unshift(<SelectableTag>tag);
      this.edit.emit(this.tags);
      this.newTagForm.reset({ name: '', color: this.newTagColor });
      this.analytics.eventTrack('Map', {
        action: 'Add tag',
        team: this.team.name,
        teamId: this.team.team_id,
      });
    }
  }

  removeTag(tag: Tag) {
    let index = this.tags.findIndex((t) => t.shortid === tag.shortid);
    if (index >= 0) {
      this.tags.splice(index, 1);
      this.analytics.eventTrack('Map', {
        action: 'Remove tag',
        team: this.team.name,
        teamId: this.team.team_id,
      });
    }
    this.edit.emit(this.tags);
  }
}
