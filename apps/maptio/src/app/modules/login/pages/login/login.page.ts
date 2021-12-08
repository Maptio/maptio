import { Component, OnInit } from '@angular/core';

import { UserService } from '@maptio-shared/services/user/user.service';


@Component({
  selector: 'maptio-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPageComponent implements OnInit {
  constructor(public userService: UserService) { }

  ngOnInit(): void {
    this.userService.processAuth0Login();
  }
}
