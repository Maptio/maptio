import { Component, Input } from '@angular/core';

import { map } from 'rxjs/operators';

import { UserService } from '@maptio-shared/services/user/user.service';


@Component({
  selector: 'maptio-onboarding-message',
  templateUrl: './onboarding-message.component.html',
  styleUrls: ['./onboarding-message.component.scss']
})
export class OnboardingMessageComponent {
  @Input() floating = false;

  showMessage$ = this.userService.user$.pipe(
    map(user => user.onboardingProgress['showEditingPanelMessage'])
  );

  constructor(public userService: UserService) {};
}
