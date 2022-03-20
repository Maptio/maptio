import { Component } from '@angular/core';

import { UserService } from '@maptio-shared/services/user/user.service';


@Component({
  selector: 'maptio-signup',
  templateUrl: './signup.page.html',
})
export class SignupComponent {
  user$ = this.userService.user$;

  constructor(private userService: UserService) {}
}
