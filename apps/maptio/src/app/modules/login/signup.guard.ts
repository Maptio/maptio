import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  CanActivateChild,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

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
    return this.user.isAuthenticated$.pipe(
      tap((isAuthenticated) => {
        // Redirect unauthenticated users to the signup page
        if (!isAuthenticated) {
          this.user.signup();
        }
      }),
      switchMap(() => this.user.user$),
      map((user) => {
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
