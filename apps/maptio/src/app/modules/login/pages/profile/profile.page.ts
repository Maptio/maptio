import { Component } from '@angular/core';

import { UserService } from '@maptio-shared/services/user/user.service';

@Component({
  selector: 'maptio-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.css'],
})
export class ProfilePageComponent {
  user$ = this.userService.user$;

  constructor(private userService: UserService) {}
}
