import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnboardingMessageComponent } from './onboarding-message/onboarding-message.component';

@NgModule({
  declarations: [OnboardingMessageComponent],
  imports: [CommonModule],
  exports: [OnboardingMessageComponent],
})
export class OnboardingMessageModule {}
