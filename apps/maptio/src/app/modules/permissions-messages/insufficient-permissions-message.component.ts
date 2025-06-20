import { Component, Input } from '@angular/core';

import { environment } from '@maptio-config/environment';


@Component({
    selector: 'maptio-insufficient-permissions-message',
    templateUrl: './insufficient-permissions-message.component.html',
    styleUrls: ['./insufficient-permissions-message.component.scss'],
    imports: []
})
export class InsufficientPermissionsMessageComponent {
  @Input() url: string = environment.KB_URL_PERMISSIONS;
}
