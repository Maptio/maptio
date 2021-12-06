import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { AuthService } from '@auth0/auth0-angular';


@Component({
  selector: 'maptio-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss']
})
export class LoginButtonComponent {
  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document,
  ) {}

  onLogin() {
    this.auth.loginWithRedirect();
  }

  onLogout() {
    this.auth.logout({
      returnTo: this.doc.location.origin,
    });
  }

  signupWithRedirect() {
    this.auth.loginWithRedirect({
      screen_hint: 'signup'
    });
  }
}
