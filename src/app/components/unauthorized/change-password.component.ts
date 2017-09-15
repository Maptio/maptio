import { EmitterService } from './../../shared/services/emitter.service';
import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, OnInit } from "@angular/core";
import { User } from "../../shared/model/user.data";

@Component({
    selector: "change-password",
    template: require("./change-password.component.html")
    // styleUrls: ["./change-password.component.css"]
})

export class ChangePasswordComponent implements OnInit {

    public email: string;
    public errorMessage: string;
    constructor(private auth: Auth) { }

    ngOnInit() { }

    resetPassword() {
        this.auth.changePassword(this.email);
        EmitterService.get("changePasswordFeedbackMessage").subscribe((message: string) => {
            this.errorMessage = message;
        })
    }
}