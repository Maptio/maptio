import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from '@maptio-environment';
import { environment as config } from '@maptio-config/environment';
import { UserService } from '@maptio-shared/services/user/user.service';

@Component({
  selector: 'maptio-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.css'],
})
export class LogoutComponent implements OnInit {
  isComingFromAuth0 = false;

  FEATURE_REQUEST_EMAIL: string = environment.FEATURE_REQUEST_EMAIL;
  SCREENSHOT_URL = config.SCREENSHOT_URL;
  SCREENSHOT_URL_FALLBACK = config.SCREENSHOT_URL_FALLBACK;

  constructor(private route: ActivatedRoute, public userService: UserService) {}

  ngOnInit() {
    // If the user goes to /logout directly, we log them out through Auth0 and
    // redirect them back here, so we need to make sure we don't trigger logout
    // again
    this.isComingFromAuth0 =
      this.route.snapshot.queryParamMap.get('auth0') === 'true';

    if (!this.isComingFromAuth0) {
      this.userService.logout();
    }
  }
}
