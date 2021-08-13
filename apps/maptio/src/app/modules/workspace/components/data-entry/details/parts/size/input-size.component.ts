import {
  Component,
  Output,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { Permissions } from '@maptio-shared/model/permission.data';


@Component({
  selector: 'initiative-input-size',
  templateUrl: './input-size.component.html',
  styleUrls: ['./input-size.component.scss']
})
export class InitiativeInputSizeComponent implements OnChanges {
  @Input() sizeAdjustment: string;
  @Input() isUnauthorized: boolean;

  @Output() save: EventEmitter<number> = new EventEmitter<number>();

  size = 0;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sizeAdjustment && changes.sizeAdjustment.currentValue) {
      this.size = Number.parseInt(changes.sizeAdjustment.currentValue);
      this.cd.markForCheck();
    }
  }

  saveSize(newSize: number) {
    console.log(typeof newSize);
    this.save.emit(newSize);
    this.size = newSize;
    this.cd.markForCheck();
  }

  onEdit(newSize: string) {
    console.log(typeof newSize);
    this.saveSize(Number.parseInt(newSize));
  }

  onIncrease() {
    this.saveSize(this.size + 1);
  }

  onDecrease() {
    this.saveSize(this.size - 1);
  }

  onReset() {
    this.saveSize(0);
  }
}
