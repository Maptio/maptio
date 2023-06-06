import { appConfig } from './app/app.config';

import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { currentOrganisationIdReducer } from './app/state/current-organisation.reducer';

import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
