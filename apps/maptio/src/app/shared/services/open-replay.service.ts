import { Injectable, NgZone } from '@angular/core';

import Tracker from '@openreplay/tracker';

import { environment } from '@maptio-environment';


@Injectable({
  providedIn: 'root'
})
export class OpenReplayService {
  public tracker?: Tracker | null;

  constructor(private zone: NgZone) {}

  public start() {
    if (!environment.OPENREPLAY_PROJECT_KEY) {
      return;
    }

    if (!this.tracker) {
      try {
        this.createTracker();
      } catch (error) {
        console.error('Failed to initialise OpenReplay:', error);
      }
    }

    this.zone.runOutsideAngular(() => {
      try {
        return this.tracker.start();
      } catch (error) {
        console.error('Failed to start OpenReplay recording:', error);
      }
    });
  }

  private createTracker() {
    this.zone.runOutsideAngular(() => {
      this.tracker = new Tracker({
        projectKey: environment.OPENREPLAY_PROJECT_KEY,

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
