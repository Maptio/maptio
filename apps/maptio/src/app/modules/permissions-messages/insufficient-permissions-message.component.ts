import { Component, Input } from '@angular/core';

import { environment } from '@maptio-config/environment';
import { NgIf } from '@angular/common';

@Component({
    selector: 'maptio-insufficient-permissions-message',
    templateUrl: './insufficient-permissions-message.component.html',
    styleUrls: ['./insufficient-permissions-message.component.scss'],
    imports: [NgIf]
})
export class InsufficientPermissionsMessageComponent {
  @Input() url: string = environment.KB_URL_PERMISSIONS;
}
