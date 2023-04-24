import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../config/environment';
import { ColorEvent } from 'ngx-color';
import { StickyPopoverDirective } from '../../directives/sticky.directive';
import { InsufficientPermissionsMessageComponent } from '../../../modules/permissions-messages/insufficient-permissions-message.component';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorHueModule } from 'ngx-color/hue';
import { NgIf } from '@angular/common';

@Component({
    selector: 'common-color-picker',
    templateUrl: './color-picker.component.html',
    standalone: true,
    imports: [NgIf, ColorHueModule, NgbPopoverModule, InsufficientPermissionsMessageComponent, StickyPopoverDirective]
})
export class ColorPickerComponent implements OnInit {
  @Input('color') color: string;
  @Input('label') label: string;
  @Input('default') defaultColor: string;
  @Input('isMinimal') isMinimal: boolean;
  @Input('isDisabled') isDisabled = false;
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
