import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Permissions } from '../../../../../../../shared/model/permission.data';
import { CommonTextareaComponent } from '../../../../../../../shared/components/textarea/textarea.component';

@Component({
  selector: 'maptio-initiative-input-name',
  templateUrl: './initiative-input-name.component.html',
  standalone: true,
  imports: [CommonTextareaComponent],
})
export class InitiativeInputNameComponent implements OnInit {
  @Input('name') name: string;
  @Input('isEditMode') isEditMode: boolean;
  @Input('isUnauthorized') isUnauthorized: boolean;

  @Output('save') save: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('inputName') inputName: ElementRef;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {}

  saveName(newName: string) {
    this.save.emit(newName);
    this.name = newName;
    this.cd.markForCheck();
  }

  onClick() {
    this.isEditMode = true;
    this.cd.markForCheck();
  }
}
