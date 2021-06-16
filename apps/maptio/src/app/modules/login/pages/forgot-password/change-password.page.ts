import { EmitterService } from "../../../../core/services/emitter.service";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { UserService } from "../../../../shared/services/user/user.service";
import { User } from "../../../../shared/model/user.data";

@Component({
    selector: "change-password",
    templateUrl: "./change-password.page.html"
})

export class ChangePasswordComponent implements OnInit {

    public email: string;
    public errorMessage: string;
    public isActivationPending: boolean;
    public isResending: boolean;
    public feedbackMessage: string;
    public changePasswordForm: FormGroup;
    public isConfirmationEmailSent:Boolean;
    public user: User;

    constructor(private userService: UserService, private cd: ChangeDetectorRef) {
        this.changePasswordForm = new FormGroup({
            "email": new FormControl(this.email, {
                validators : [
                    Validators.required
                ], updateOn : "submit"
            })
        });
    }

    ngOnInit() { }

    resetPassword() {
        this.feedbackMessage = "";
        this.errorMessage = "";
        this.isActivationPending = false;
        this.user = null;
        if (this.changePasswordForm.dirty && this.changePasswordForm.valid) {
            let email = this.changePasswordForm.controls["email"].value;

            this.userService.isActivationPendingByEmail(email)
                .then(({ isActivationPending, user_id }) => {
                    if (isActivationPending) {
                        this.userService.getUsersInfo([new User({ user_id: user_id })])
                            .then(users => {
                                if (users.length !== 1) {
                                    throw "There are more than one user with this email! Please contact us."
                                }
                                this.user = users[0];
                            })
                            .then(() => { this.isActivationPending = true; this.cd.markForCheck() })
                    }
                    else {
                        this.userService.changePassword(email);
                        EmitterService.get("changePasswordFeedbackMessage").subscribe((message: string) => {
                            this.feedbackMessage = message;
                            this.cd.markForCheck();
                        })
                    }
                })
                .catch((error) => {
                    this.errorMessage = error;
                })
        }
    }

    resendEmail() {
        this.isResending = true;
        this.isConfirmationEmailSent = false;
        this.userService.sendConfirmation(this.user.email, this.user.user_id, this.user.firstname, this.user.lastname, this.user.name).then(() => {
            this.isResending = false;
            this.isConfirmationEmailSent = true;
            this.cd.markForCheck();
        })
    }
}