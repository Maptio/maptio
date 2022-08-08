import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'maptio-language-picker',
  templateUrl: './language-picker.component.html',
  styleUrls: ['./language-picker.component.scss'],
})
export class LanguagePickerComponent {
  currentLocation: string;

  constructor(private location: Location) {}

  onClick() {
    this.currentLocation = this.location.path();
  }
}
