import { Component } from '@angular/core';

import { environment } from '@maptio-config/environment';

@Component({
  selector: 'maptio-insufficient-permissions-message',
  templateUrl: './insufficient-permissions-message.component.html',
  styleUrls: ['./insufficient-permissions-message.component.scss'],
})
export class InsufficientPermissionsMessageComponent {
  KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;
}
