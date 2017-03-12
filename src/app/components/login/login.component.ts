import { Auth } from "./../../shared/services/auth.service";
import { Component, OnInit } from "@angular/core";

@Component({
    selector: "login",
    template: ""
})
export class LoginComponent implements OnInit {
    constructor(private auth: Auth) { }

    ngOnInit() {
        this.auth.login();
    }
}