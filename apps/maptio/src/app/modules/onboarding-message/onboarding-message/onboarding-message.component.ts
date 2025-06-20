import { Component, HostBinding, Input } from '@angular/core';

import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@maptio-environment';
import { User } from '@maptio-shared/model/user.data';
import { UserRole } from '@maptio-shared/model/permission.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { PermissionsService } from '@maptio-shared/services/permissions/permissions.service';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'maptio-onboarding-message',
    templateUrl: './onboarding-message.component.html',
    styleUrls: ['./onboarding-message.component.scss'],
    imports: [NgIf, AsyncPipe]
})
export class OnboardingMessageComponent {
  @Input() floating = false;

  @HostBinding('style.display') display = 'block';
  @HostBinding('style.padding-top') paddingTopValue: number;
  @Input() set paddingTop(paddingTop: number) {
    this.paddingTopValue = paddingTop;
  }

  messageKey$ = new BehaviorSubject<string>('');
  @Input() set messageKey(messageKey: string) {
    this.messageKey$.next(messageKey);
  }

  helpPageUrl = '';

  user?: User;

  private hideMessageManually$ = new BehaviorSubject<boolean>(false);

  // Show message only if user has not already dismissed it and only if they
  // are an admin
  showMessage$ = combineLatest([
    this.hideMessageManually$,
    this.permissionsService.canSeeOnboardingMessages$,
    this.userService.user$,
    this.messageKey$,
  ]).pipe(
    map(([hideMessageManually, canSeeOnboardingMessages, user, messageKey]) => {
      this.user = user;

      if (
        !hideMessageManually &&
        canSeeOnboardingMessages &&
        user &&
        messageKey &&
        Object.prototype.hasOwnProperty.call(
          user.onboardingProgress,
          messageKey
        )
      ) {
        this.helpPageUrl = environment.ONBOARDING_MESSAGES[messageKey];
        return user.onboardingProgress[messageKey];
      } else {
        return false;
      }
    })
  );

  constructor(
    public userService: UserService,
    private permissionsService: PermissionsService
  ) {}

  dismissMessage() {
    const messageKey = this.messageKey$.value;

    if (this.user && messageKey) {
      const onboardingProgress = this.user.onboardingProgress;
      onboardingProgress[messageKey] = false;

      this.userService.updateUserOnboardingProgress(
        this.user,
        onboardingProgress
      );
      this.hideMessageManually$.next(true);
    }
  }
}
