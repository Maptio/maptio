import { Component } from '@angular/core';
import { ErrorPageComponent } from '../error/error.page';

@Component({
    selector: 'maptio-unauthorized',
    templateUrl: './unauthorized.component.html',
    standalone: true,
    imports: [ErrorPageComponent]
})
export class UnauthorizedComponent {}
