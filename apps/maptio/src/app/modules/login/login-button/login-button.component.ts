import { Component } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';


@Component({
  selector: 'maptio-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss']
})
export class LoginButtonComponent {
  constructor(public auth: AuthService) { }

  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }

  signupWithRedirect() {
    this.auth.loginWithRedirect({
      screen_hint: 'signup'
    });
  }
}
