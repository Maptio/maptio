import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'initiative-description-textarea',
  templateUrl: './description-textarea.component.html',
  // styleUrls: ['./description-textarea.component.css']
})
export class InitiativeDescriptionTextareaComponent implements OnInit {
  @Input('description') description: string;
  @Input('isEditMode') isEditMode: boolean;
  @Input('isUnauthorized') isUnauthorized: boolean;

  @Output('save') save: EventEmitter<string> = new EventEmitter<string>();

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {}

  onChange(description: string) {
    this.description = description;
    this.save.emit(description);
    this.cd.markForCheck();
  }

  onClick(event: Event) {
    this.isEditMode = true;
    this.cd.markForCheck();
  }

  onBlur(event: Event) {
    this.isEditMode = false;
    this.cd.markForCheck();
  }
}
