import { Component, Input } from '@angular/core';

@Component({
  selector: 'maptio-onboarding-message',
  templateUrl: './onboarding-message.component.html',
  styleUrls: ['./onboarding-message.component.scss']
})
export class OnboardingMessageComponent {
  @Input() floating = false;
}
