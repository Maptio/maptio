import { EmitterService } from "./../../shared/services/emitter.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
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

    constructor(private userService: UserService, private cd:ChangeDetectorRef) {
        this.changePasswordForm = new FormGroup({
            "email": new FormControl(this.email, [
                Validators.required
            ])
        });
    }

    ngOnInit() { }

    resetPassword() {
        this.feedbackMessage = "";
        this.errorMessage = "";
        if (this.changePasswordForm.dirty && this.changePasswordForm.valid) {
            let email = this.changePasswordForm.controls["email"].value;

            this.userService.isActivationPendingByEmail(email)
                .then(({ isActivationPending, user_id }) => {
                    if (isActivationPending) {
                        this.errorMessage = "Looks like you're haven't confirmed your email yet! Check your email to setup your account."
                        this.cd.markForCheck();
                    }
                    else {
                        this.userService.changePassword(email);
                        EmitterService.get("changePasswordFeedbackMessage").subscribe((message: string) => {
                            console.log(message)
                            this.feedbackMessage = message;
                            this.cd.markForCheck();
                        })
                    }
                })
        }
    }
}