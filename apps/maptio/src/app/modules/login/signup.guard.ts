import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  CanActivateChild,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '@maptio-shared/services/user/user.service';


@Injectable({
  providedIn: 'root',
})
export class SignupGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private user: UserService,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.redirectHomeIfActivatedOrToAuth0IfNotAuthenticated();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.redirectHomeIfActivatedOrToAuth0IfNotAuthenticated();
  }

  private redirectHomeIfActivatedOrToAuth0IfNotAuthenticated(): Observable<boolean | UrlTree> {
    return this.user.user$.pipe(
      map((user) => {
        // Redirect unauthenticated users to the signup page
        if (!user) {
          this.user.signup();
        }

        // Redirect signed up users to the home page
        if (!user.isActivationPending) {
          return this.router.parseUrl('/home');
        }

        // Let through users who are authenticated but not yet signed up
        return true;
      })
    );
  }
}
