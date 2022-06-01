import { Component, Input } from '@angular/core';

import { environment } from '@maptio-environment';
import { Team } from '@maptio-shared/model/team.data';


@Component({
  selector: 'maptio-onboarding-banner',
  templateUrl: './onboarding-banner.component.html',
  styleUrls: ['./onboarding-banner.component.scss']
})
export class OnboardingBannerComponent {
  @Input() set team(team: Team) {
    this.remainingTrialTimeMessage = team.getFreeTrialTimeLeftMessage();
    const freeTrialCutoffDate = team.getFreeTrialCutoffDate();
    this.freeTrialCutoffDateMessage = `
      Free trial ends on ${freeTrialCutoffDate.toLocaleDateString()}
      at ${freeTrialCutoffDate.toLocaleTimeString()}
    `;
  }

  BOOK_ONBOARDING_URL = environment.BOOK_ONBOARDING_URL;
  REQUEST_TRIAL_EXTENSION_EMAIL = environment.REQUEST_TRIAL_EXTENSION_EMAIL;
  SUBSCRIBE_NOW_LINK = environment.SUBSCRIBE_NOW_LINK;

  freeTrialCutoffDateMessage: string;
  remainingTrialTimeMessage: string;
}
