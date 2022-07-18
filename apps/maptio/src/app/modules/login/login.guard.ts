import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  CanActivateChild,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private auth: AuthService) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.redirectHomeIfAuthenticated();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.redirectHomeIfAuthenticated();
  }

  private redirectHomeIfAuthenticated(): Observable<boolean | UrlTree> {
    return this.auth.isAuthenticated$.pipe(
      map((loggedIn) => {
        if (loggedIn) {
          return this.router.parseUrl('/home');
        } else {
          console.error(
            'Not authenticated in the login page guard, this should never happen'
          );
          return false;
        }
      })
    );
  }
}
