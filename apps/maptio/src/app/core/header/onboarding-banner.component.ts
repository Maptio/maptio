import { Component, Input } from '@angular/core';

import { Team } from '@maptio-shared/model/team.data';


@Component({
  selector: 'maptio-onboarding-banner',
  templateUrl: './onboarding-banner.component.html',
  styleUrls: ['./onboarding-banner.component.scss']
})
export class OnboardingBannerComponent {
  @Input() team?: Team;
}
