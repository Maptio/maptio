import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { Auth } from "../../shared/services/auth/auth.service";

@Component({
  selector: "logout",
  templateUrl: "./logout.component.html"

})
export class LogoutComponent implements OnInit {
  constructor(private auth: Auth, private router: Router, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.auth.clear();
    // this.cd.detectChanges();
    // this.router.navigateByUrl("/home");
  }
}
