import { Injectable, NgZone } from '@angular/core';

import Tracker from '@openreplay/tracker';


@Injectable({
  providedIn: 'root'
})
export class OpenReplayService {
  public tracker?: Tracker | null;

  constructor(private zone: NgZone) {}

  public start() {
    if (!this.tracker) {
      this.createTracker();
    }

    this.zone.runOutsideAngular(() => {
      try {
        return this.tracker.start();
      } catch (error) {
        console.error('Failed to start OpenReplay:');
        console.error(error);
      }
    });
  }

  private createTracker() {
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
}
