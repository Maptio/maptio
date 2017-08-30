import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, OnInit } from "@angular/core";
import { User } from "../../shared/model/user.data";

@Component({
    selector: "verify-email",
    template: require("./verify-email.component.html"),
    styleUrls: ["./verify-email.component.css"]
})

export class VerifyEmailComponent implements OnInit {

    isConfirmationSent: boolean;
    isWaiting: boolean;
    constructor(private auth: Auth) { }

    ngOnInit() { }

    sendConfirmationEmail() {
        this.isWaiting = true;
        this.isConfirmationSent = undefined;
        this.auth.getUser().subscribe((user: User) => {
            this.auth.sendConfirmationEmail(user.user_id).then((isConfirmationSent: boolean) => {
                this.isConfirmationSent = isConfirmationSent;
                this.isWaiting = false;
            })
                .catch((error) => {
                    this.isConfirmationSent = false;
                    this.isWaiting = false;
                })
        });
    }
}