import { Component, Input } from '@angular/core';

import { environment } from '@maptio-environment';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';

@Component({
  selector: 'maptio-onboarding-banner',
  templateUrl: './onboarding-banner.component.html',
  styleUrls: ['./onboarding-banner.component.scss'],
})
export class OnboardingBannerComponent {
  @Input() set user(user: User) {
    if (user?.teams?.length > 1) {
      this.showTeamName = true;
    } else {
      this.showTeamName = false;
    }
  }

  @Input() set team(team: Team) {
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
}
