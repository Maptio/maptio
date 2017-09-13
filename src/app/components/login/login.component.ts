import { Params } from "@angular/router";
import { ActivatedRoute, Router } from "@angular/router";
import { Auth } from "./../../shared/services/auth/auth.service";
import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { JwtEncoder } from "../../shared/services/encoding/jwt.service";
import { EmitterService } from "../../shared/services/emitter.service";
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from "@angular/forms";
@Component({
    selector: "login",
    template: require("./login.component.html")
})
export class LoginComponent implements OnInit {

    public email: string;
    public password: string;
    public firstname: string;
    public lastname: string;
    public isTermsAccepted: boolean = false;
    public isActivationPending: Promise<boolean>;
    public isLoggingIn: boolean;
    public isPasswordEmpty: boolean;
    public loginErrorMessage: string;
    public isPasswordTooWeak: boolean;
    public isUserAlreadyActive: boolean;
    public activationStatusCannotBeUpdated: boolean;

    public activateForm: FormGroup;
    public loginForm: FormGroup;

    constructor(private auth: Auth, private route: ActivatedRoute, private router: Router, public encoding: JwtEncoder, public formBuilder: FormBuilder) {
        this.activateForm = new FormGroup({
            "firstname": new FormControl(this.firstname, [
                Validators.required,
                Validators.minLength(2)
            ]),
            "lastname": new FormControl(this.lastname, [
                Validators.required,
                Validators.minLength(2)
            ]),
            "password": new FormControl(this.password, [
                Validators.required
            ]),
            "isTermsAccepted": new FormControl(this.isTermsAccepted, [
                Validators.requiredTrue
            ])
        });

        this.loginForm = new FormGroup({
            "email": new FormControl(this.email, [
                Validators.required
            ]),
            "password": new FormControl(this.password, [
                Validators.required
            ])
        });



    }


    ngOnInit() {
        this.route.queryParams.subscribe((params: Params) => {
            let token = params["token"];
            this.isLoggingIn = (token === undefined);
            if (!this.isLoggingIn) {
                this.encoding.decode(token)
                    .then((decoded: any) => {
                        console.log(decoded)
                        this.email = decoded.email
                        this.firstname = ""
                        this.lastname = ""
                        return decoded.user_id;
                    })
                    .then((user_id: string) => {
                        this.isActivationPending = this.auth.isActivationPending(user_id);
                        this.isActivationPending.then((isPending: boolean) => {
                            console.log("activation pending", isPending)
                            if (!isPending) {
                                this.router.navigateByUrl("/login")
                                // window.location.href = "/login";
                            }
                        })
                        return user_id;
                    })
                    .catch((err) => {
                        console.log(err)
                        // anything goes wrong, we redirect to usual login page
                        // window.location.href = "/login";
                        this.router.navigateByUrl("/login")
                    })
            }

        })


    }

    passwordChange() {
        // Browser bug similar to https://github.com/angular/angular.js/issues/15985
        // so i have to check that password after  submit
        this.isPasswordEmpty = (this.password === "")
    }

    login(): void {
        if (this.loginForm.dirty && this.loginForm.valid) {

            let email = this.loginForm.controls["email"].value
            let password = this.loginForm.controls["password"].value
            console.log(email, password);
            this.auth.isUserExist(email).then((isUserExist: boolean) => {
                if (isUserExist) {
                    let user = this.auth.login(email, password)
                    EmitterService.get("loginErrorMessage").subscribe((loginErrorMessage: string) => {
                        this.loginErrorMessage = "Wrong password";
                    })
                }
                else{
                    this.loginErrorMessage = "We don't know that email."
                }
            })
        }
    }


    activateAccount(): void {
        if (this.activateForm.dirty && this.activateForm.valid) {
            let email = this.email
            let firstname = this.activateForm.controls["firstname"].value
            let lastname = this.activateForm.controls["lastname"].value
            let password = this.activateForm.controls["password"].value

            this.route.queryParams.subscribe((params: Params) => {
                let token = params["token"];
                if (token) {

                    return this.encoding.decode(token)
                        .then((decoded: any) => {
                            return [decoded.user_id, decoded.email];
                        })
                        .then(([user_id, email]: [string, string]) => {
                            return this.auth.isActivationPending(user_id)
                                .then(
                                (isActivationPending: boolean) => {
                                    if (!isActivationPending)
                                        throw new Error(`User ${email} is already active`)
                                    return user_id;
                                },
                                (error: any) => {
                                    this.isUserAlreadyActive = true;
                                    return Promise.reject("User has already activated account");
                                });
                        })
                        .then((user_id: string) => {
                            return this.auth.updateUserInformation(user_id, password, firstname, lastname)
                                .then(isUpdated => {
                                    if (isUpdated) {
                                        return Promise.resolve(user_id)
                                    }
                                },
                                (error: any) => {
                                    this.isPasswordTooWeak = true;
                                    return Promise.reject("Password cannot be updated");
                                })
                        })
                        .then((user_id: string) => {
                            return this.auth.updateActivationPendingStatus(user_id, false).then((isUpdated) => {
                                return user_id
                            },
                                (error: any) => {
                                    this.activationStatusCannotBeUpdated = true;
                                    return Promise.reject("Status cannot be updated");
                                })
                        })
                        .then((user_id: string) => {
                            this.isActivationPending = Promise.resolve(false);
                        })
                        .catch((err) => {
                        })

                }
                else {
                }

            },
                (err: Error) => {
                    this.loginErrorMessage = "Something has gone wrong! Please email us at support@maptio.com and we'll help you out."
                }
            )
        }

    }
}