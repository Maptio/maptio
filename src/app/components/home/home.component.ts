import { Auth } from "./../../shared/services/auth.service";
import { Component, OnInit } from "@angular/core";

@Component({
    selector: "home",
    template: require("./home.component.html")
})
export class HomeComponent implements OnInit {
    constructor(private auth: Auth) { }

    ngOnInit() { }
}