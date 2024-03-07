import { Route } from '@angular/router';

import { PreviewComponent } from './preview.component';

export default [
  {
    path: '',
    component: PreviewComponent,
    outlet: 'empty',
  },
] satisfies Route[];
