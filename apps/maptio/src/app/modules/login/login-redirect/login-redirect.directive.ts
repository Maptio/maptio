import { Directive, HostListener, Input } from '@angular/core';

import { UserService } from '@maptio-shared/services/user/user.service';

@Directive({
  selector: '[maptioLoginRedirect]',
})
export class LoginRedirectDirective {
  @Input() isSignup = false;

  constructor(public userService: UserService) {}

  @HostListener('click') onClick() {
    if (this.isSignup) {
      this.userService.signup();
    } else {
      this.userService.login();
    }
  }
}
