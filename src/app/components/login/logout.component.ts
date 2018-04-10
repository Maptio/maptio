import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { Auth } from "../../shared/services/auth/auth.service";

@Component({
  selector: "logout",
  templateUrl: "./logout.component.html"

})
export class LogoutComponent implements OnInit {
  constructor(private auth: Auth) { }

  ngOnInit() {
    this.auth.clear();
  }
}
