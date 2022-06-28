import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../config/environment';
import { ColorEvent } from 'ngx-color';

@Component({
  selector: 'common-color-picker',
  templateUrl: './color-picker.component.html',
  // styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {
  @Input('color') color: string;
  @Input('label') label: string;
  @Input('default') defaultColor: string;
  @Input('isMinimal') isMinimal: boolean;
  @Input('isDisabled') isDisabled: boolean = false;
  @Output('change')
  changeColor: EventEmitter<string> = new EventEmitter<string>();

  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

  constructor() {}

  ngOnInit(): void {}

  pickColor(e: ColorEvent) {
    this.changeColor.emit(e.color.hex);
  }

  reset() {
    this.pickColor(<ColorEvent>{
      color: {
        hex: this.defaultColor,
      },
    });
  }
}
