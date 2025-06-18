import { Serializable } from '../interfaces/serializable.interface';

import { isEmpty } from 'lodash-es';

export class OnboardingProgress implements Serializable<OnboardingProgress> {
  showEditingPanelMessage = false;
  showCircleDetailsPanelMessage = false;
  showCircleCanvasMessage = false;
  showOnboardingVideo = false;

  public constructor(init?: Partial<OnboardingProgress>) {
    Object.assign(this, init);
  }

  static create(): OnboardingProgress {
    return new OnboardingProgress();
  }

  deserialize(input: OnboardingProgress): OnboardingProgress {
    const deserialized = new OnboardingProgress();

    // This will ensure that old users who don't have the message key in their
    // onboarding progress will not see the messages/video
    if (!isEmpty(input)) {
      deserialized.showEditingPanelMessage =
        input.showEditingPanelMessage ?? false;
      deserialized.showCircleDetailsPanelMessage =
        input.showCircleDetailsPanelMessage ?? false;
      deserialized.showCircleCanvasMessage =
        input.showCircleCanvasMessage ?? false;
      deserialized.showOnboardingVideo = input.showOnboardingVideo ?? false;
    }

    return deserialized;
  }

  tryDeserialize(input: OnboardingProgress): [boolean, OnboardingProgress] {
    try {
      const onboardingProgress = this.deserialize(input);
      if (onboardingProgress !== undefined) {
        return [true, onboardingProgress];
      } else {
        return [false, undefined];
      }
    } catch (Exception) {
      return [false, undefined];
    }
  }
}
