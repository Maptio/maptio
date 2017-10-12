import { UserService } from "./../../shared/services/user/user.service";
import { ErrorService } from "./../../shared/services/error/error.service";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Subscription } from "rxjs/Rx";
import { User } from "./../../shared/model/user.data";
import { Component } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";


@Component({
    selector: "account",
    templateUrl: "./account.component.html",
    styleUrls: ["./account.component.css"]
})
export class AccountComponent {

    public user: User;
    public subscription: Subscription;
    public accountForm: FormGroup;
    public errorMessage: string;
    public feedbackMessage: string;

    public firstname: string;
    public lastname: string;


    constructor(public auth: Auth, public errorService: ErrorService, private userService: UserService) {
        this.accountForm = new FormGroup({
            "firstname": new FormControl(this.firstname, [
                Validators.required
            ]),
            "lastname": new FormControl(this.firstname, [
                Validators.required
            ])
        });
    }

    ngOnInit() {
        this.subscription = this.auth.getUser().subscribe((user: User) => {
            this.user = user;
            console.log(user)
            this.firstname = user.firstname;
            this.lastname = user.lastname;
        },
            (error: any) => { this.errorService.handleError(error) });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    save() {
        if (this.accountForm.dirty && this.accountForm.valid) {
            let firstname = this.accountForm.controls["firstname"].value;
            let lastname = this.accountForm.controls["lastname"].value;

            this.userService.updateUserProfile(this.user.user_id, firstname, lastname, "")
                .then((hasUpdated: boolean) => {
                    if (hasUpdated) {
                        this.auth.getUser();
                        this.feedbackMessage = "Successfully updated."
                    }
                    else
                        return Promise.reject("Can't update your user information.")
                }, (reason) => { this.errorMessage = reason })

        }
    }

}