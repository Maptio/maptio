import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpLogInterceptor } from './httpInterceptor';


export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpLogInterceptor, multi: true },
];
