
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: "logout",
    template: ""
})

export class LogoutComponent implements OnInit {

    constructor(private router: Router) {
        localStorage.clear();
    }

    ngOnInit() {
        
        this.router.navigateByUrl("/home");
    }

}