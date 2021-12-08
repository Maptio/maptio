import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';
import { SubSink } from 'subsink';


@Component({
  selector: 'maptio-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  constructor(public auth: AuthService) { }

  ngOnInit(): void {
    this.subs.sink = this.auth.user$.subscribe((profile) => {
      console.log(profile);
      // 1. If null, redirect to Auth0
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
