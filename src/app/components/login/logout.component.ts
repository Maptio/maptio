
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { Auth } from "../../shared/services/auth/auth.service";

@Component({
    selector: "logout",
    template: ""
})

export class LogoutComponent implements OnInit {

    constructor(private router: Router, private auth:Auth, private cd:ChangeDetectorRef) {
    }

    ngOnInit() {
        localStorage.clear();
        this.cd.detectChanges();
        this.router.navigateByUrl("/home");
    }

}