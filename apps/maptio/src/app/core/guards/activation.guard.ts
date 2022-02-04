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
export class ActivationGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private user: UserService,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.redirectToSignupIfNotActivated();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.redirectToSignupIfNotActivated();
  }

  private redirectToSignupIfNotActivated(): Observable<boolean | UrlTree> {
    return this.user.user$.pipe(
      map((user) => {
        // Redirect unauthenticated users to the signup page
        if (!user) {
          console.error('User is not authenticated in activation guard, this should never happen');
          return this.router.parseUrl('/login');
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
