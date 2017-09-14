import { LoaderService } from "./../../shared/services/http/loader.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserFactory } from "./../../shared/services/user.factory";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, OnInit } from "@angular/core";
import { User } from "../../shared/model/user.data";

@Component({
    selector: "signup",
    template: require("./signup.component.html")
})

export class SignupComponent implements OnInit {

    public TOS_URL: string = "https://termsfeed.com/terms-conditions/f0e548940bde8842b1fb58637ae048c0"
    public PRIVACY_URL: string = "https://termsfeed.com/privacy-policy/61f888ebea93b0029582b88a7be1e1e3"


    public email: string;
    public firstname: string;
    public lastname: string;
    public isTermsAccepted: boolean;

    public isEmailAlreadyExist: boolean
    public isRedirectToActivate: boolean;
    public isConfirmationEmailSent: boolean;
    public signUpMessageFail: string;
    public userToken: string;

    public signupForm: FormGroup;

    constructor(private auth: Auth, private router: Router, private userFactory: UserFactory, private loader: LoaderService) {
        this.signupForm = new FormGroup({
            "firstname": new FormControl(this.firstname, [
                Validators.required,
                Validators.minLength(2)
            ]),
            "lastname": new FormControl(this.lastname, [
                Validators.required,
                Validators.minLength(2)
            ]),
            "email": new FormControl(this.email, [
                Validators.required
            ]),
            "isTermsAccepted": new FormControl(this.isTermsAccepted, [
                Validators.requiredTrue
            ])
        });

    }

    ngOnInit() { }

    createAccount() {
        this.isConfirmationEmailSent = false;
        this.isRedirectToActivate = false;
        this.isEmailAlreadyExist = false;
        this.signUpMessageFail = "";
        this.loader.show();

        if (this.signupForm.dirty && this.signupForm.valid) {

            let email = this.signupForm.controls["email"].value
            let firstname = this.signupForm.controls["firstname"].value
            let lastname = this.signupForm.controls["lastname"].value

            Promise.all([this.isEmailExist(email), this.isActivationPending(email, firstname, lastname)]).then(([isEmailExist, { isActivationPending, userToken }]) => {
                if (isEmailExist) {
                    if (isActivationPending) {
                        // account is created but still needs activation => redirect to activation page
                        this.userToken = userToken;
                        this.isRedirectToActivate = true;
                    }
                    else {
                        // account is created and is already activated => this user should login
                        this.isEmailAlreadyExist = true;
                    }
                }
                else {
                    // no matching email => create user
                    this.auth.createUser(email, firstname, lastname, true)
                        .then((user: User) => {
                            return user;
                        })
                        .then((user: User) => {
                            // console.log("create user", user)
                            return this.userFactory.create(user)
                        })
                        .then((user: User) => {
                            this.isConfirmationEmailSent = true;
                        })
                        .catch((error: Error) => {
                            this.signUpMessageFail = `We are having issues creating your account! Please email us at support@maptio.com and we'll help you out. `
                        })
                }
            }).then(() => { this.loader.hide(); })
        }
    }

    isEmailExist(email: string): Promise<boolean> {
        return this.userFactory.getAll(email).then((matches: User[]) => {
            // console.log(matches, matches.length)
            if (matches.length === 1) {
                // this.isEmailAlreadyExist = true;
                return true;
            }
            if (matches.length > 1) {
                this.signUpMessageFail = `Several users are registered with this email! Please email us at support@maptio.com and we'll help you out. `
                return true;
            }
            return false
        })
    }

    isActivationPending(email: string, firstname: string, lastname: string) {
        return this.userFactory.getAll(email)
            .then((matches: User[]) => {
                if (!matches || matches.length === 0) {
                    return;
                }
                if (matches.length === 1) {
                    return matches[0].user_id;
                }
                if (matches.length > 1) {
                    this.signUpMessageFail = `Several users are registered with this email! Please email us at support@maptio.com and we'll help you out. `
                    throw new Error(this.signUpMessageFail);
                }

            })
            .then((userId: string) => {
                if (!userId) {
                    return Promise.resolve({ isActivationPending: false, userToken: null })
                }
                return this.auth.isActivationPending(userId).then((isActivationPending: boolean) => {
                    // console.log(isActivationPending)
                    if (isActivationPending) {
                        return this.auth.generateUserToken(userId, email, firstname, lastname).then(token => {
                            return { isActivationPending, userToken: token }
                        });
                    }
                })
            })
    }
}
