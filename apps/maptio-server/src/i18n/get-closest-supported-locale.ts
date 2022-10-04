/*
 * This code is taked from:
 * https://phrase.com/blog/posts/angular-localization-i18n/
 */

export function getClosestSupportedLocale(
  acceptsLocales: string[],
  supportedLocales: string[],
  defaultLocale: string
) {
  // I removed this one as it caused the following language preferences:
  // ['en', 'pl', 'fr'] to result in the app showing up in Polish because 'en'
  // did not match 'en-US'. It's better to default to first language match.
  // firstExactMatch(acceptsLocales, supportedLocales) ||

  return firstLanguageMatch(acceptsLocales, supportedLocales) || defaultLocale;
}

// This is not used, see comment above. Keeping it as it works in case we want
// to use it later.
// function firstExactMatch(acceptsLocales: string[], supportedLocales: string[]) {
//   return acceptsLocales.find((al) => supportedLocales.includes(al));
// }

function firstLanguageMatch(
  acceptsLocales: string[],
  supportedLocales: string[]
) {
  for (const acceptedLanguage of languagesFor(acceptsLocales)) {
    const match = supportedLocales.find(
      (supportedLocale) => languageFor(supportedLocale) === acceptedLanguage
    );

    if (match) {
      return match;
    }
  }
}

function languagesFor(locales: string[]) {
  return locales.map((locale) => languageFor(locale));
}

function languageFor(locale: string) {
  return locale.split('-')[0];
}
