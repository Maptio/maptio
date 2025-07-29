import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';

import { UserService } from '@maptio-shared/services/user/user.service';
import { TeamService } from '@maptio-shared/services/team/team.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  router = inject(Router);
  userService = inject(UserService);
  teamService = inject(TeamService);

  constructor() {}

  isAuthenticated = toSignal(this.userService.isAuthenticated$);
  isCurrentTeamSubscribed = this.teamService.isCurrentTeamSubscribed;

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
