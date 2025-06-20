import { Component } from '@angular/core';
import { ErrorPageComponent } from '../error/error.page';

@Component({
    selector: 'maptio-unauthorized',
    templateUrl: './unauthorized.component.html',
    imports: [ErrorPageComponent]
})
export class UnauthorizedComponent {}
