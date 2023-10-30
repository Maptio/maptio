import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnboardingMessageComponent } from './onboarding-message/onboarding-message.component';

@NgModule({
    imports: [CommonModule, OnboardingMessageComponent],
    exports: [OnboardingMessageComponent]
})
export class OnboardingMessageModule {}
