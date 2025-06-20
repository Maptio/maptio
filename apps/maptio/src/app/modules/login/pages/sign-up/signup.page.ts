import { Component } from '@angular/core';

import { UserService } from '@maptio-shared/services/user/user.service';
import { MemberFormComponent } from '../../../member-form/member-form.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'maptio-signup',
    templateUrl: './signup.page.html',
    imports: [MemberFormComponent, AsyncPipe]
})
export class SignupComponent {
  user$ = this.userService.user$;

  constructor(private userService: UserService) {}
}
