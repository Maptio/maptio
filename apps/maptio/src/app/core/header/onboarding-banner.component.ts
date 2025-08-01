import { Component, Input, inject } from '@angular/core';

import { environment } from '@maptio-environment';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { OnboardingService } from 'app/onboarding/onboarding.service';

@Component({
  selector: 'maptio-onboarding-banner',
  templateUrl: './onboarding-banner.component.html',
  styleUrls: ['./onboarding-banner.component.scss'],
  imports: [NgbTooltipModule, RouterLink],
})
export class OnboardingBannerComponent {
  onboardingService = inject(OnboardingService);
  isOnboardingVideoVisible = this.onboardingService.isOnboardingVideoVisible;

  @Input() set user(user: User) {
    if (!user) {
      return;
    }

    if (user?.teams?.length > 1) {
      this.showTeamName = true;
    } else {
      this.showTeamName = false;
    }
  }

  @Input() set team(team: Team) {
    if (!team) {
      return;
    }

    this.teamName = team.name;
    this.remainingTrialTimeMessage = team.getFreeTrialTimeLeftMessage();
    const freeTrialCutoffDate = team.getFreeTrialCutoffDate();
    this.freeTrialCutoffDateMessage = $localize`
      Free trial ends on ${freeTrialCutoffDate.toLocaleDateString()}
      at ${freeTrialCutoffDate.toLocaleTimeString()}
    `;
  }

  BOOK_ONBOARDING_URL = environment.BOOK_ONBOARDING_URL;
  REQUEST_TRIAL_EXTENSION_EMAIL = environment.REQUEST_TRIAL_EXTENSION_EMAIL;
  SUBSCRIBE_NOW_LINK = environment.SUBSCRIBE_NOW_LINK;

  showTeamName = false;
  teamName: string;
  freeTrialCutoffDateMessage: string;
  remainingTrialTimeMessage: string;

  async toggleOnboardingVideo() {
    await this.onboardingService.toggleOnboardingVideo();
  }
}
