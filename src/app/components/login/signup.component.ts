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

    public email: string;
    public password: string;
    public firstname: string;
    public lastname: string;
    public isPasswordEmpty: boolean;

    public isEmailAlreadyExist: boolean
    public isRedirectToActivate: boolean;
    public isConfirmationEmailSent: boolean;
    public signUpMessageFail: string;
    public userToken: string;


    constructor(private auth: Auth, private router: Router, private userFactory: UserFactory) { }

    ngOnInit() { }

    passwordChange() {
        // Browser bug similar to https://github.com/angular/angular.js/issues/15985
        // so i have to check that password after  submit
        this.isPasswordEmpty = (this.password === "")
    }

    createAccount(firstname: string, lastname: string, email: string) {

        Promise.all([this.isEmailExist(email), this.isActivationPending(email)]).then(([isEmailExist, { isActivationPending, userToken }]) => {
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
                        console.log("create user", user)
                        return this.userFactory.create(user)
                    })
                    .then((user: User) => {
                        this.isConfirmationEmailSent = true;
                        // this.signUpMessageOK = `We have sent a confirmation email to ${user.email}`
                    })
                    .catch((error: Error) => {
                        this.signUpMessageFail = `We are having issues creating your account! Please email us at support@maptio.com and we'll help you out. `
                    })
            }
        })
    }

    isEmailExist(email: string): Promise<boolean> {
        return this.userFactory.getAll(email).then((matches: User[]) => {
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

    isActivationPending(email: string) {
        return this.userFactory.getAll(email)
            .then((matches: User[]) => {
                if (matches.length === 1) {
                    return matches[0].user_id;
                }
                else {
                    this.signUpMessageFail = `Several users are registered with this email! Please email us at support@maptio.com and we'll help you out. `
                    throw new Error(this.signUpMessageFail);
                }
            })
            .then((userId: string) => {
                return this.auth.isActivationPending(userId).then((isActivationPending: boolean) => {
                    if (isActivationPending) {
                        return this.auth.generateUserToken(userId, email).then(token => {
                            return { isActivationPending, userToken: token }
                        });
                    }
                })
            })
    }
}
