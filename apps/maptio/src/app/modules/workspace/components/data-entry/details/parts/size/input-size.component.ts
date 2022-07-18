import {
  Component,
  Output,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { environment } from '@maptio-config/environment';

@Component({
  selector: 'initiative-input-size',
  templateUrl: './input-size.component.html',
  styleUrls: ['./input-size.component.scss'],
})
export class InitiativeInputSizeComponent implements OnChanges {
  @Input() sizeAdjustment: string;
  @Input() isUnauthorized: boolean;

  @Output() save: EventEmitter<number> = new EventEmitter<number>();

  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

  size = 0;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sizeAdjustment) {
      this.size = changes.sizeAdjustment.currentValue
        ? Number.parseInt(changes.sizeAdjustment.currentValue)
        : 0;
      this.cd.markForCheck();
    }
  }

  saveSize(newSize: number) {
    this.save.emit(newSize);
    this.size = newSize;
    this.cd.markForCheck();
  }

  onEdit(newSize: string) {
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
