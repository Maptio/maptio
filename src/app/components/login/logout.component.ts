
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: "logout",
    template: ""
})

export class LogoutComponent implements OnInit {

    constructor(private router: Router) {
    }

    ngOnInit() {
        localStorage.clear();
        this.router.navigateByUrl("/home");
    }

}