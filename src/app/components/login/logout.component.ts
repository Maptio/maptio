import { Component, OnInit } from "@angular/core";
import { Auth } from "../../shared/services/auth/auth.service";

@Component({
  selector: "logout",
  templateUrl: "./logout.component.html",
  styleUrls: ["./logout.component.css"]

})
export class LogoutComponent implements OnInit {
  constructor(private auth: Auth) { }

  ngOnInit() {
    this.auth.logout();
  }
}
