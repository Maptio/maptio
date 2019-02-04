import { Angulartics2Mixpanel } from "angulartics2";
import { UserService } from "../../../../shared/services/user/user.service";
import { Subscription } from "rxjs/Subscription";
import { LoaderService } from "../../../../shared/services/loading/loader.service";
import { Params } from "@angular/router";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { JwtEncoder } from "../../../../shared/services/encoding/jwt.service";
import { EmitterService } from "../../../../shared/services/emitter.service";
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Auth } from "../../../../core/authentication/auth.service";
@Component({
    selector: "login",
    templateUrl: "./login.page.html"
})
export class LoginComponent implements OnInit {


    public TOS_URL: string = "https://termsfeed.com/terms-conditions/f0e548940bde8842b1fb58637ae048c0"
    public PRIVACY_URL: string = "https://termsfeed.com/privacy-policy/61f888ebea93b0029582b88a7be1e1e3"

    public token: string;
    public email: string;
    public password: string;
    public firstname: string;
    public lastname: string;
    public isTermsAccepted: boolean = false;
    public isActivationPending: Promise<boolean>;
    public isLoggingIn: boolean;
    public isPasswordEmpty: boolean;
    public isPasswordTooWeak: boolean;
    public isUserAlreadyActive: boolean;
    public activationStatusCannotBeUpdated: boolean;
    public previousAttemptMessage: string;


    public loginErrorMessage: string;
    public isWrongPassword: Boolean;
    public isUnknownEmail: Boolean;

    public activateForm: FormGroup;
    public loginForm: FormGroup;

    public subscription: Subscription;

    constructor(private auth: Auth, private userService: UserService, private route: ActivatedRoute, private router: Router,
        public encoding: JwtEncoder, public formBuilder: FormBuilder, private loader: LoaderService, private analytics: Angulartics2Mixpanel,
        private cd: ChangeDetectorRef) {
        this.activateForm = new FormGroup({
            "firstname": new FormControl(this.firstname, {
                validators: [
                    Validators.required,
                    Validators.minLength(2)
                ],
                updateOn: "submit"
            }),
            "lastname": new FormControl(this.lastname, {
                validators: [
                    Validators.required,
                    Validators.minLength(2)
                ],
                updateOn: "submit"
            }),
            "password": new FormControl(this.password, {
                validators: [
                    Validators.required, Validators.minLength(8)
                ],
                updateOn: "submit"
            }),
            "isTermsAccepted": new FormControl(this.isTermsAccepted, {
                validators: [
                    Validators.requiredTrue
                ],
                updateOn: "submit"
            })
        });

        this.loginForm = new FormGroup({
            "email": new FormControl(this.email, {
                validators: [
                    Validators.required, Validators.email
                ],
                updateOn: "submit"
            }),
            "password": new FormControl(this.password, {
                validators: [
                    Validators.required
                ],
                updateOn: "submit"
            })
        });
    }

    ngOnDestroy() {
        if (this.subscription)
            this.subscription.unsubscribe();
    }

    ngOnInit() {
        if (this.auth.allAuthenticated()) {
            this.router.navigateByUrl("/home");
            return;
        }

        this.subscription = this.route.queryParams.subscribe((params: Params) => {
            this.token = params["token"];
            // HACK : wouldbe nicer to have booleans for login attempt cases, but that will do for now
            this.previousAttemptMessage = params["login_message"];

            this.isLoggingIn = (this.token === undefined);
            if (!this.isLoggingIn) {
                this.encoding.decode(this.token)
                    .then((decoded: any) => {
                        this.email = decoded.email
                        this.firstname = decoded.firstname
                        this.lastname = decoded.lastname
                        this.cd.markForCheck();
                        return decoded.user_id;
                    })
                    .then((user_id: string) => {
                        this.isActivationPending = this.userService.isActivationPendingByUserId(user_id);
                        this.isActivationPending.then((isPending: boolean) => {
                            if (!isPending) {
                                this.router.navigateByUrl("/login")
                            }
                        })
                        return user_id;
                    })
                    .catch((err) => {
                        console.error(err);
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

        this.loginErrorMessage = "";
        this.isWrongPassword = false;
        this.isUnknownEmail = false;
        if (this.loginForm.dirty && this.loginForm.valid) {
            this.auth.clear();
            this.loader.show();
            let email = this.loginForm.controls["email"].value
            let password = this.loginForm.controls["password"].value

            this.userService.isUserExist(email)
                .then((isUserExist: boolean) => {
                    if (isUserExist) {
                        this.loader.show();
                        this.auth.login(email, password)
                        this.loader.show();
                        // HACK .login() should be promisified instead of using EmitterService
                        EmitterService.get("loginErrorMessage").subscribe((loginErrorMessage: string) => {
                            if (loginErrorMessage === "Wrong email or password.") {
                                this.isWrongPassword = true
                            } else {
                                this.loginErrorMessage = loginErrorMessage;
                            }
                            this.loader.hide();
                        })
                    }
                    else {
                        this.loader.hide();
                        this.isUnknownEmail = true;
                    }
                })
                .then(() => {
                    this.cd.markForCheck();
                })
        }
    }


    activateAccount(): void {
        this.isUserAlreadyActive = false;
        this.isPasswordTooWeak = false;
        this.activationStatusCannotBeUpdated = false;

        if (this.activateForm.dirty && this.activateForm.valid) {
            this.loader.show();
            let email = this.email
            let firstname = this.activateForm.controls["firstname"].value
            let lastname = this.activateForm.controls["lastname"].value
            let password = this.activateForm.controls["password"].value
            if (this.token) {
                this.encoding.decode(this.token)
                    .then((decoded: any) => {
                        this.loader.show();
                        return [decoded.user_id, decoded.email];
                    })
                    .then(([user_id, email]: [string, string]) => {
                        this.loader.show();
                        return this.userService.isActivationPendingByUserId(user_id)
                            .then(
                                (isActivationPending: boolean) => {
                                    if (!isActivationPending)
                                        throw new Error(`User ${email} is already active`)
                                    return user_id;
                                },
                                (error: any) => {
                                    this.isUserAlreadyActive = true;
                                    this.cd.markForCheck();
                                    this.loader.hide();
                                    return Promise.reject("User has already activated account");
                                });
                    })
                    .then((user_id: string) => {
                        this.loader.show();
                        return this.userService.updateUserCredentials(user_id, password, firstname, lastname)
                            .then(isUpdated => {
                                if (isUpdated) {
                                    return Promise.resolve(user_id)
                                }
                                throw "Password cannot be updated";
                            },
                                (error: any) => {
                                    this.isPasswordTooWeak = true;
                                    this.cd.markForCheck();
                                    this.loader.hide();
                                    throw "Password cannot be updated";
                                })
                    })
                    .then((user_id: string) => {
                        this.loader.show();
                        return this.userService.updateActivationPendingStatus(user_id, false).then((isUpdated) => {
                            return user_id
                        },
                            (error: any) => {
                                this.activationStatusCannotBeUpdated = true;
                                this.cd.markForCheck();
                                this.loader.hide();
                                return Promise.reject("Status cannot be updated");
                            })
                    })
                    .then((user_id: string) => {
                        this.loader.show();
                        this.isActivationPending = Promise.resolve(false);
                    })
                    .then(() => {
                        this.loader.show();
                        this.analytics.eventTrack("Activate", { email: email, firstname: firstname, lastname: lastname });
                    }, () => { })
                    .then(() => {
                        this.loader.show();
                        this.auth.login(email, password);
                        this.loader.hide();
                    })
            }
            else {
                this.loginErrorMessage = "Missing token. Check your email for an activation link!"
            }
        }

    }
}