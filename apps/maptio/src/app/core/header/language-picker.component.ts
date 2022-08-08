import { Component, Inject, LOCALE_ID } from '@angular/core';
import { Location } from '@angular/common';

import { CookieService } from 'ngx-cookie-service';

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

  constructor(
    @Inject(LOCALE_ID) public currentLocaleCode: string,
    private cookieService: CookieService,
    private location: Location
  ) {
    this.currentLocale = this.LOCALES.find(
      (locale) => locale.code === this.currentLocaleCode
    );
  }

  onLanguageSelection(locale: Locale) {
    // Setting a cookie to enable the server to set the correct locale
    // immediately when the user navigates to maptio.com without adding the
    // locale to the URL
    this.cookieService.set('locale', locale.code);

    // Forcing a reload (bypassing Angular router) to reload index file
    // corresponding to the selected locale
    window.location.href = '/' + locale.code + this.location.path();
  }
}
