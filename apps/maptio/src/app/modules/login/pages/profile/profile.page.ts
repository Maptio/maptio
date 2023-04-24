import { Component } from '@angular/core';

import { UserService } from '@maptio-shared/services/user/user.service';
import { MemberFormComponent } from '../../../member-form/member-form.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'maptio-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.css'],
    standalone: true,
    imports: [NgIf, MemberFormComponent, AsyncPipe]
})
export class ProfilePageComponent {
  user$ = this.userService.user$;

  constructor(private userService: UserService) {}
}
