import { Component } from '@angular/core';
import { ErrorPageComponent } from '../error/error.page';

@Component({
    selector: 'maptio-login-error',
    templateUrl: './login-error.page.html',
    imports: [ErrorPageComponent]
})
export class LoginErrorPageComponent {}
