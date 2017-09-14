import { Subscription } from "rxjs/Subscription";
import { LoaderService } from "./../../shared/services/http/loader.service";
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


    public TOS_URL: string = "https://termsfeed.com/terms-conditions/f0e548940bde8842b1fb58637ae048c0"
    public PRIVACY_URL: string = "https://termsfeed.com/privacy-policy/61f888ebea93b0029582b88a7be1e1e3"

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
    public previousAttemptMessage: string;

    public activateForm: FormGroup;
    public loginForm: FormGroup;

    private subscription: Subscription;

    constructor(private auth: Auth, private route: ActivatedRoute, private router: Router, public encoding: JwtEncoder, public formBuilder: FormBuilder, private loader: LoaderService) {
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
            // HACK : wouldbe nicer to have booleans for login attempt cases, but that will do for now
            this.previousAttemptMessage = params["login_message"];

            this.isLoggingIn = (token === undefined);
            if (!this.isLoggingIn) {
                this.encoding.decode(token)
                    .then((decoded: any) => {
                        console.log(decoded)
                        this.email = decoded.email
                        this.firstname = decoded.firstname
                        this.lastname = decoded.lastname
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

        this.loginErrorMessage = ""
        if (this.loginForm.dirty && this.loginForm.valid) {
            this.loader.show();
            let email = this.loginForm.controls["email"].value
            let password = this.loginForm.controls["password"].value
            console.log(email, password);
            this.auth.isUserExist(email)
                .then((isUserExist: boolean) => {
                    if (isUserExist) {
                        let user = this.auth.login(email, password)
                        // HACK .login() should be promisified instead of using EmitterService
                        EmitterService.get("loginErrorMessage").subscribe((loginErrorMessage: string) => {
                            this.loginErrorMessage =
                                (loginErrorMessage === "Wrong email or password.") ? "Wrong password" : loginErrorMessage;
                            this.loader.hide();
                        })
                    }
                    else {
                        this.loginErrorMessage = "We don't know that email."
                        this.loader.hide();
                    }
                }).
                then(() => {
                    this.loader.hide();
                })
        }
    }


    activateAccount(): void {
        this.isUserAlreadyActive = false;
        this.isPasswordTooWeak = false;
        this.activationStatusCannotBeUpdated = false;
        ;
        if (this.activateForm.dirty && this.activateForm.valid) {
            this.loader.show();
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
                                    this.loader.hide();
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
                                    this.loader.hide();
                                    return Promise.reject("Password cannot be updated");
                                })
                        })
                        .then((user_id: string) => {
                            return this.auth.updateActivationPendingStatus(user_id, false).then((isUpdated) => {
                                return user_id
                            },
                                (error: any) => {
                                    this.activationStatusCannotBeUpdated = true;
                                    this.loader.hide();
                                    return Promise.reject("Status cannot be updated");
                                })
                        })
                        .then((user_id: string) => {
                            this.isActivationPending = Promise.resolve(false);
                            this.loader.hide();
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