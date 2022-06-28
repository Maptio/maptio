import { Component } from '@angular/core';

import { environment } from '@maptio-environment';

@Component({
  selector: 'app-terms',
  template: `
    <iframe
      src="${environment.TERMS_AND_CONDITIONS_URL}"
      width="100%"
      height="100%"
      frameborder="0"
    ></iframe>
  `,
})
export class TermsComponent {}
