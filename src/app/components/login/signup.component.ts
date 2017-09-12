import { Component, OnInit } from "@angular/core";

@Component({
    selector: "signup",
    template: require("./signup.component.html")
})

export class SignupComponent implements OnInit {

    public email: string;
    public password: string;
    public firstname: string;
    public lastname: string;
    public isPasswordEmpty: boolean;

    constructor() { }

    ngOnInit() { }

    passwordChange() {
        // Browser bug similar to https://github.com/angular/angular.js/issues/15985
        // so i have to check that password after  submit
        this.isPasswordEmpty = (this.password === "")
    }
}