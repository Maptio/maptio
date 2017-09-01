import { Params } from "@angular/router";
import { ActivatedRoute, Router } from "@angular/router";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, OnInit } from "@angular/core";
import { JwtEncoder } from "../../shared/services/encoding/jwt.service";

@Component({
    selector: "login",
    template: require("./login.component.html")
})
export class LoginComponent implements OnInit {
    constructor(private auth: Auth, private route: ActivatedRoute, private router: Router, public encoding: JwtEncoder) { }

    public email: string;
    public password: string;
    public isTermsAccepted: boolean = false;

    public isActivationPending: Promise<boolean>;

    ngOnInit() {
        this.route.queryParams.subscribe((params: Params) => {
            let token = params["token"];

            if (token) {
                this.encoding.decode(token)
                    .then((decoded: any) => {
                        console.log(decoded)
                        this.email = decoded.email
                        return decoded.user_id;
                    })
                    .then((user_id: string) => {
                        this.isActivationPending = this.auth.isActivationPending(user_id);
                        this.isActivationPending.then((isPending: boolean) => {
                            console.log("activation pending", isPending)
                            if (!isPending) {
                                this.auth.login();
                            }
                        })
                        return user_id;
                    })
                    .catch(() => {
                        // anything goes wrong, we redirect to usual login page
                        this.auth.login();
                    })
            }
            else {
                this.auth.login();
            }
        })
    }


    activateAccount(): void {

        this.route.queryParams.subscribe((params: Params) => {
            let token = params["token"];
            if (token) {

                return this.encoding.decode(token)
                    .then((decoded: any) => {
                        return [decoded.user_id, decoded.email];
                    })
                    .then(([user_id, email]: [string, string]) => {
                        return this.auth.isActivationPending(user_id).then((isActivationPending: boolean) => {

                            if (!isActivationPending)
                                throw new Error(`User ${email} is already active`)
                            return user_id;
                        });
                    })
                    .then((user_id: string) => {
                        this.auth.updatePassword(user_id, this.password);
                        return user_id;
                    })
                    .then((user_id: string) => {
                        this.auth.updateActivationPendingStatus(user_id, false);
                        return user_id;
                    })
                    .then((user_id: string) => {
                        this.isActivationPending = Promise.resolve(false)
                        this.router.navigateByUrl("/account/profile")
                    })
                    .catch(() => {

                        throw new Error("Something has gone wrong")
                    })

            }
            else {

                throw new Error("Cannot find the activation token")
            }

        },
            (err: Error) => {
                console.log(err)
            }
        )
    }
}