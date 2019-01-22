import { Component, OnInit } from "@angular/core";
import { Auth } from "../../shared/services/auth/auth.service";
import { environment } from "../../../environment/environment";

@Component({
  selector: "logout",
  templateUrl: "./logout.component.html",
  styleUrls: ["./logout.component.css"]

})
export class LogoutComponent implements OnInit {
  SURVEY_URL: string = environment.SURVEY_URL;
  SCREENSHOT_URL = environment.SCREENSHOT_URL;

  constructor(private auth: Auth) { }

  ngOnInit() {
    this.auth.logout();
  }
}
