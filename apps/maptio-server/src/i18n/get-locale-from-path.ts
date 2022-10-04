export function getLocaleFromPath(path: string, supportedLocales: string[]) {
  const pathComponents = path.split('/');
  const suspectedLocale = pathComponents[1];
  const isLocaleInPath = supportedLocales.includes(suspectedLocale);

  return isLocaleInPath ? suspectedLocale : null;
}
