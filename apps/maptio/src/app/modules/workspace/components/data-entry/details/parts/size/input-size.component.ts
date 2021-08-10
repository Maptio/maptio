import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Permissions } from '../../../../../../../shared/model/permission.data';

@Component({
  selector: 'initiative-input-size',
  templateUrl: './input-size.component.html',
  // styleUrls: ['./input-size.component.css']
})
export class InitiativeInputSizeComponent {
  @Input() sizeModifier: string;
  @Input() isEditMode: boolean;
  @Input() isUnauthorized: boolean;

  @Output() save: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild("inputName") inputName: ElementRef;

  size = 0;

  constructor(private cd: ChangeDetectorRef) { }

  saveSize(newSize: number) {
    this.save.emit(newSize);
    this.size = newSize;
    this.cd.markForCheck();
  }

  onChange(newSize: number) {
    console.log('got new size', newSize);
    this.saveSize(newSize);
  }

  onClick() {
    this.isEditMode = true;
    this.cd.markForCheck();
  }
}
