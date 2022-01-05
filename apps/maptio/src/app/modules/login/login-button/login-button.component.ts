import { Component } from '@angular/core';

import { UserService } from '@maptio-shared/services/user/user.service';


@Component({
  selector: 'maptio-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss']
})
export class LoginButtonComponent {
  constructor(public userService: UserService) {}

  onLogin() {
    this.userService.login();
  }
}
