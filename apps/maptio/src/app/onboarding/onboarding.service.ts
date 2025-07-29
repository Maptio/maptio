import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';

import { UserService } from '@maptio-shared/services/user/user.service';
import { TeamService } from '@maptio-shared/services/team/team.service';
import { PermissionsService } from '@maptio-shared/services/permissions/permissions.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  router = inject(Router);
  userService = inject(UserService);
  teamService = inject(TeamService);
  permissionsService = inject(PermissionsService);

  user = toSignal(
    this.userService.userWithTeamsAndDatasets$.pipe(map((data) => data.user)),
  );

  constructor() {}

  isAuthenticated = toSignal(this.userService.isAuthenticated$);
  isCurrentTeamSubscribed = this.teamService.isCurrentTeamSubscribed;

  onboardingVideoMessageKey = 'showOnboardingVideo';

  private canSeeOnboardingMessages = toSignal(
    this.permissionsService.canSeeOnboardingMessages$,
  );

  // Manual override for when user explicitly toggles the video
  private isOnboardingVideoHiddenManually = signal<boolean | null>(null);

  // Computed signal that determines onboarding video visibility
  isOnboardingVideoVisible = computed(() => {
    if (this.isOnboardingVideoHiddenManually() !== null) {
      return this.isOnboardingVideoHiddenManually();
    }

    if (
      this.canSeeOnboardingMessages() &&
      this.user() &&
      Object.prototype.hasOwnProperty.call(
        this.user().onboardingProgress,
        this.onboardingVideoMessageKey,
      )
    ) {
      return (
        this.user().onboardingProgress[this.onboardingVideoMessageKey] === true
      );
    } else {
      return false;
    }
  });

  async toggleOnboardingVideo() {
    if (!this.user()) {
      return;
    }

    const onboardingProgress = this.user().onboardingProgress;
    const newVisibility = !this.isOnboardingVideoVisible();

    onboardingProgress[this.onboardingVideoMessageKey] = newVisibility;

    this.isOnboardingVideoHiddenManually.set(newVisibility);

    await this.userService.updateUserOnboardingProgress(
      this.user(),
      onboardingProgress,
    );
  }

  showOnboardingFeatures(): boolean {
    return (
      this.isAuthenticated() &&
      (this.isMap() || this.isHome() || this.isTeam()) &&
      !this.isCurrentTeamSubscribed()
    );
  }

  private isMap(): boolean {
    return this.router.url.startsWith('/map');
  }

  private isHome(): boolean {
    return this.router.url.startsWith('/home');
  }

  private isTeam(): boolean {
    return this.router.url.startsWith('/teams');
  }
}
