import { Component, Input } from '@angular/core';

import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserRole } from '@maptio-shared/model/permission.data';
import { UserService } from '@maptio-shared/services/user/user.service';


@Component({
  selector: 'maptio-onboarding-message',
  templateUrl: './onboarding-message.component.html',
  styleUrls: ['./onboarding-message.component.scss']
})
export class OnboardingMessageComponent {
  @Input() floating = false;

  messageKey$ = new BehaviorSubject<string>('');
  @Input() set messageKey(messageKey: string) {
    this.messageKey$.next(messageKey);
  }

  // Show message only if user has not already dismissed it and only if they
  // are an admin
  showMessage$ = combineLatest([
    this.messageKey$,
    this.userService.user$,
  ]).pipe(
    map(([messageKey, user]) => {
      if (
        user &&
        messageKey &&
        user.userRole === UserRole.Admin &&
        Object.prototype.hasOwnProperty.call(user.onboardingProgress, messageKey)
      ) {
        return user.onboardingProgress[messageKey];
      } else {
        return false;
      }
    })
  );

  constructor(public userService: UserService) {};
}
