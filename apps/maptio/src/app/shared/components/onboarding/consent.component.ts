import {
  Component,
  Input,
  ChangeDetectorRef
} from '@angular/core';

import { UserFactory } from '@maptio-core/http/user/user.factory';
import { User } from '@maptio-shared/model/user.data';


@Component({
  selector: 'maptio-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss']
})
export class ConsentComponent {
  @Input() user: User;

  isTogglingConsent = false;
  hasTogglingConsentFailed = false;

  constructor(
    private cd: ChangeDetectorRef,
    private userFactory: UserFactory,
  ) { }

  async toggleConsent(event: Event) {
    if (this.isTogglingConsent) {
      return;
    };

    this.isTogglingConsent = true;
    this.hasTogglingConsentFailed = false;
    this.cd.markForCheck();

    const target = event?.target as HTMLInputElement;
    this.user.consentForSessionRecordings = target.checked;
    this.user.consentForSessionRecordingsUpdatedAt = new Date();

    let result = false;
    try {
      result = await this.userFactory.upsert(this.user);
    } catch {
      // Error handled below
      result = false;
    }

    if (!result) {
      this.hasTogglingConsentFailed = true;
      this.user.consentForSessionRecordings = !this.user.consentForSessionRecordings;
      target.checked = this.user.consentForSessionRecordings;
    }

    this.isTogglingConsent = false;
    this.cd.markForCheck();
  }
}
