import {
  Component,
  OnInit,
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
export class ConsentComponent implements OnInit {
  @Input() user: User;

  isTogglingConsent = false;
  isTogglingConsentFailed = false;

  constructor(
    private cd: ChangeDetectorRef,
    private userService: UserFactory,
  ) { }

  // async toggleShowingDescriptions(event: Event) {
  //   if (this.isTogglingShowingDescriptions) {
  //     return;
  //   };

  //   this.isTogglingShowingDescriptions = true;
  //   this.hasTogglingShowingDescriptionsFailed = false;
  //   this.cd.markForCheck();

  //   const target = event?.target as HTMLInputElement;
  //   this.dataset.showDescriptions = target.checked;

  //   let result = false;
  //   try {
  //     result = await this.datasetFactory.upsert(this.dataset);
  //   } catch {
  //     // Error handled below
  //     result = false;
  //   }

  //   if (!result) {
  //     this.hasTogglingShowingDescriptionsFailed = true;
  //     this.dataset.showDescriptions = !this.dataset.showDescriptions;
  //     target.checked = this.dataset.showDescriptions;
  //   }

  //   this.isTogglingShowingDescriptions = false;
  //   this.cd.markForCheck();
  // }
}
