import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  CanActivateChild,
  UrlTree,
} from '@angular/router';

import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class ActivationGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private user: UserService) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.redirectToSignupIfNotActivated();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.redirectToSignupIfNotActivated();
  }

  private redirectToSignupIfNotActivated(): Observable<boolean | UrlTree> {
    return this.user.isAuthenticated$.pipe(
      concatMap((isAuthenticated) => {
        if (!isAuthenticated) {
          return of(false);
        } else {
          return this.user.user$;
        }
      }),
      map((user) => {
        // Let unauthenticated users through (necessary for the home page that
        // can be accessed by unauthenticated users, in all other places
        // AuthGuard needs to be used separately to ensure authentication)
        if (!(user instanceof User)) {
          return true;
        }

        // Redirect users who have not completed the sign up form to the home page
        if (user.isActivationPending) {
          return this.router.parseUrl('/signup');
        }

        // Let through users who are authenticated but not yet signed up
        return true;
      })
    );
  }
}
