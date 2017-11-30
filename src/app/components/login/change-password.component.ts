import { EmitterService } from "./../../shared/services/emitter.service";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { UserService } from "../../shared/services/user/user.service";

@Component({
    selector: "change-password",
    templateUrl: "./change-password.component.html"
})

export class ChangePasswordComponent implements OnInit {

    public email: string;
    public errorMessage: string;
    public feedbackMessage: string;
    public changePasswordForm: FormGroup;

    constructor(private userService: UserService) {
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

            this.userService.isActivationPendingByEmail(email)
                .then(({ isActivationPending, user_id }) => {
                    if (isActivationPending) {
                        this.errorMessage = "Looks like you're haven't confirmed your email yet! Check your email to setup your account."
                    }
                    else {
                        this.userService.changePassword(email);
                        EmitterService.get("changePasswordFeedbackMessage").subscribe((message: string) => {
                            this.feedbackMessage = message;
                        })
                    }
                })
        }
    }
}