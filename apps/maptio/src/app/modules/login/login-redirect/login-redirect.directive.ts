import { Directive, HostListener } from '@angular/core';

import { UserService } from '@maptio-shared/services/user/user.service';


@Directive({
  selector: '[maptioLoginRedirect]'
})
export class LoginRedirectDirective {
  constructor(public userService: UserService) {}

  @HostListener('click') onClick() {
    this.onLogin();
  }

  onLogin() {
    this.userService.login();
  }
}
