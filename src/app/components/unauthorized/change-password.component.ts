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
    public feedbackMessage:string;
    constructor(private auth: Auth) { }

    ngOnInit() { }

    resetPassword() {

        this.auth.isActivationPendingByEmail(this.email)
            .then(({ isActivationPending, user_id }) => {
                if (isActivationPending) {
                    this.errorMessage = "Looks like you're haven't confirmed your email yet! Check your email to setup your account."
                }
                else {
                    this.auth.changePassword(this.email);
                    EmitterService.get("changePasswordFeedbackMessage").subscribe((message: string) => {
                        this.feedbackMessage = message;
                    })
                }
            })


    }
}