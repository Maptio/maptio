import { Injectable, NgZone } from '@angular/core';

import Tracker from '@openreplay/tracker';


@Injectable({
  providedIn: 'root'
})
export class OpenReplayService {
  public tracker?: Tracker | null;

  constructor(private zone: NgZone) {
    this.zone.runOutsideAngular(() => {
      this.tracker = new Tracker({
        projectKey: "XchYPkjBhtyztTjamVfo",

        // Privacy settings
        respectDoNotTrack: true,
        obscureTextEmails: true,
        obscureTextNumbers: true,
        obscureInputEmails: true,
        defaultInputMode: 1,
      });
    });
  }

  public start() {
    this.zone.runOutsideAngular(() => {
      if (this.tracker) {
        return this.tracker.start();
      }
    });
  }
}
