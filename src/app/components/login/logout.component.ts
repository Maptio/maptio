import { Component, OnInit } from "@angular/core";
import { Auth } from "../../core/authentication/auth.service";
import { environment } from "../../config/environment";

@Component({
  selector: "logout",
  templateUrl: "./logout.component.html",
  styleUrls: ["./logout.component.css"]

})
export class LogoutComponent implements OnInit {
  SURVEY_URL: string = environment.SURVEY_URL;
  SCREENSHOT_URL = environment.SCREENSHOT_URL;
  SCREENSHOT_URL_FALLBACK = environment.SCREENSHOT_URL_FALLBACK;

  constructor(private auth: Auth) { }

  ngOnInit() {
    this.auth.logout();
  }
}
