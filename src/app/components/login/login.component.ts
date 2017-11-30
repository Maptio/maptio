import { Angulartics2Mixpanel } from "angulartics2";
import { UserService } from "./../../shared/services/user/user.service";
import { Subscription } from "rxjs/Subscription";
import { LoaderService } from "./../../shared/services/loading/loader.service";
import { Params } from "@angular/router";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit} from "@angular/core";
import { JwtEncoder } from "../../shared/services/encoding/jwt.service";
import { EmitterService } from "../../shared/services/emitter.service";
import { FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import { Auth } from "../../shared/services/auth/auth.service";
@Component({
    selector: "login",
    templateUrl: "./login.component.html"
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
    public loginErrorMessage: string;
    public isPasswordTooWeak: boolean;
    public isUserAlreadyActive: boolean;
    public activationStatusCannotBeUpdated: boolean;
    public previousAttemptMessage: string;

    public activateForm: FormGroup;
    public loginForm: FormGroup;

    public subscription: Subscription;

    constructor(private auth: Auth, private userService: UserService, private route: ActivatedRoute, private router: Router,
        public encoding: JwtEncoder, public formBuilder: FormBuilder, private loader: LoaderService, private analytics: Angulartics2Mixpanel) {
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

    ngOnDestroy() {
        if (this.subscription)
            this.subscription.unsubscribe();
    }

    ngOnInit() {
        if (this.auth.authenticated()) {
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
                        return decoded.user_id;
                    })
                    .then((user_id: string) => {
                        this.isActivationPending = this.userService.isActivationPendingByUserId(user_id);
                        this.isActivationPending.then((isPending: boolean) => {
                            // console.log("activation pending", isPending)
                            if (!isPending) {
                                this.router.navigateByUrl("/login")
                                // window.location.href = "/login";
                            }
                        })
                        return user_id;
                    })
                    .catch((err) => {
                        // console.log(err)
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
            localStorage.clear();
            this.loader.show();
            let email = this.loginForm.controls["email"].value
            let password = this.loginForm.controls["password"].value

            this.userService.isUserExist(email)
                .then((isUserExist: boolean) => {
                    if (isUserExist) {
                        this.auth.login(email, password)
                        // HACK .login() should be promisified instead of using EmitterService
                        EmitterService.get("loginErrorMessage").subscribe((loginErrorMessage: string) => {
                            this.loginErrorMessage =
                                (loginErrorMessage === "Wrong email or password.") ? "Wrong password" : loginErrorMessage;
                            this.loader.hide();
                        })
                    }
                    else {
                        this.loginErrorMessage = "We don't know that email"
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

        if (this.activateForm.dirty && this.activateForm.valid) {
            this.loader.show();
            let email = this.email
            let firstname = this.activateForm.controls["firstname"].value
            let lastname = this.activateForm.controls["lastname"].value
            let password = this.activateForm.controls["password"].value
            if (this.token) {
                this.encoding.decode(this.token)
                    .then((decoded: any) => {
                        return [decoded.user_id, decoded.email];
                    })
                    .then(([user_id, email]: [string, string]) => {
                        return this.userService.isActivationPendingByUserId(user_id)
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
                        return this.userService.updateUserCredentials(user_id, password, firstname, lastname)
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
                        return this.userService.updateActivationPendingStatus(user_id, false).then((isUpdated) => {
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
                    .then(() => {
                        this.analytics.eventTrack("Activate", { email: email, firstname: firstname, lastname: lastname });
                    }, () => { })
                    .then(() => {
                        this.auth.login(email, password)
                    })
            }
            else {
                this.loginErrorMessage = "Missing token. Check your email for an activation link!"
            }
        }

    }
}