import { Component, Inject, LOCALE_ID } from '@angular/core';
import { Location } from '@angular/common';

import { environment } from '@maptio-environment';

import { Locale } from './locale.interface';

@Component({
  selector: 'maptio-language-picker',
  templateUrl: './language-picker.component.html',
  styleUrls: ['./language-picker.component.scss'],
})
export class LanguagePickerComponent {
  LOCALES = environment.LOCALES;

  currentLocale: Locale;
  currentLocation: string;

  constructor(
    @Inject(LOCALE_ID) public currentLocaleCode: string,
    private location: Location
  ) {
    this.currentLocale = this.LOCALES.find(
      (locale) => locale.code === this.currentLocaleCode
    );
  }

  onClick() {
    this.currentLocation = this.location.path();
  }
}
