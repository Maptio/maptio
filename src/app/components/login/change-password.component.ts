import { EmitterService } from "./../../shared/services/emitter.service";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, OnInit } from "@angular/core";
import { User } from "../../shared/model/user.data";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
    selector: "change-password",
    template: require("./change-password.component.html")
})

export class ChangePasswordComponent implements OnInit {

    public email: string;
    public errorMessage: string;
    public feedbackMessage: string;
    public changePasswordForm: FormGroup;

    constructor(private auth: Auth) {
        this.changePasswordForm = new FormGroup({
            "email": new FormControl(this.email, [
                Validators.required
            ])
        });
    }

    ngOnInit() { }

    resetPassword() {
        if (this.changePasswordForm.dirty && this.changePasswordForm.valid) {
            let email = this.changePasswordForm.controls["email"].value;

            this.auth.isActivationPendingByEmail(email)
                .then(({ isActivationPending, user_id }) => {
                    if (isActivationPending) {
                        this.errorMessage = "Looks like you're haven't confirmed your email yet! Check your email to setup your account."
                    }
                    else {
                        this.auth.changePassword(email);
                        EmitterService.get("changePasswordFeedbackMessage").subscribe((message: string) => {
                            this.feedbackMessage = message;
                        })
                    }
                })
        }
    }
}