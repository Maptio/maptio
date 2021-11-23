import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';
import { User } from '../../../../shared/model/user.data';
import { UserService } from '../../../../shared/services/user/user.service';
import { repeatValidator } from '../../../../shared/directives/equal-validator.directive';
import { UserRole } from '../../../../shared/model/permission.data';
import { LoaderService } from '../../../../shared/components/loading/loader.service';
import { Auth } from '../../../../core/authentication/auth.service';

@Component({
  selector: 'signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.css'],
})
export class SignupComponent implements OnInit {
  public TOS_URL: string =
    'https://termsfeed.com/terms-conditions/f0e548940bde8842b1fb58637ae048c0';
  public PRIVACY_URL: string =
    'https://termsfeed.com/privacy-policy/61f888ebea93b0029582b88a7be1e1e3';

  public email: string;
  public firstname: string;
  public lastname: string;

  public isEmailAlreadyExist: boolean;
  public isRedirectToActivate: boolean;
  public isConfirmationEmailSent: boolean;
  public signUpMessageFail: string;

  public userToken: string;
  public userId: string;
  public isResending: boolean;
  public isConfirmationEmailResent: boolean;

  public signupForm: FormGroup;

  constructor(
    private userService: UserService,
    private loader: LoaderService,
    private auth: Auth,
    private analytics: Angulartics2Mixpanel,
    private cd: ChangeDetectorRef,
    public loaderService: LoaderService
  ) {
    this.signupForm = new FormGroup({
      firstname: new FormControl(this.firstname, {
        validators: [Validators.required, Validators.minLength(2)],
        updateOn: 'submit',
      }),
      lastname: new FormControl(this.lastname, {
        validators: [Validators.required, Validators.minLength(2)],
        updateOn: 'submit',
      }),
      email: new FormControl(this.email, {
        validators: [Validators.required, Validators.email],
        updateOn: 'submit',
      }),
    });
    new FormControl(this.email, {
      validators: Validators.required,
      updateOn: 'blur',
    });
  }

  ngOnInit() {}

  createAccount() {
    this.isConfirmationEmailSent = false;
    this.isRedirectToActivate = false;
    this.isEmailAlreadyExist = false;
    this.signUpMessageFail = '';
    this.isResending = false;

    if (this.signupForm.dirty && this.signupForm.valid) {
      this.loaderService.show();
      let email = this.signupForm.controls['email'].value;
      let firstname = this.signupForm.controls['firstname'].value;
      let lastname = this.signupForm.controls['lastname'].value;

      Promise.all([
        this.isEmailExist(email),
        this.isActivationPending(email, firstname, lastname),
      ])
        .then(([isEmailExist, { isActivationPending, userToken }]) => {
          this.loaderService.show();
          if (isEmailExist) {
            if (isActivationPending) {
              // account is created but still needs activation => display message to check email or resend invitation
              this.userToken = userToken;
              this.isRedirectToActivate = true;
              this.cd.markForCheck();
            } else {
              // account is created and is already activated => this user should login or try to get a confirmation email again
              this.isEmailAlreadyExist = true;
              this.userToken = userToken;
              this.cd.markForCheck();
            }
          } else {
            // no matching email => create user
            return this.userService
              .createUser(email, firstname, lastname, true, true)
              .then(
                (user: User) => {
                  this.userId = user.user_id;
                  return user;
                },
                () => {
                  this.signUpMessageFail = `${email} is not a valid email address`;
                  this.cd.markForCheck();
                  return Promise.reject(
                    `${email} is not a valid email address`
                  );
                }
              )
              .then((user: User) => {
                return this.userService
                  .sendConfirmation(
                    user.email,
                    user.user_id,
                    user.firstname,
                    user.lastname,
                    user.name
                  )
                  .then(
                    (success: boolean) => {
                      this.isConfirmationEmailSent = success;
                      this.cd.markForCheck();
                    },
                    (reason) => {
                      this.isConfirmationEmailSent = false;
                      this.signUpMessageFail = `Confirmation email failed to send`;
                      this.cd.markForCheck();
                      return Promise.reject(
                        'Confirmation email failed to send'
                      );
                    }
                  );
              })
              .then(
                () => {
                  this.analytics.eventTrack('Sign up', {
                    email: email,
                    firstname: firstname,
                    lastname: lastname,
                  });
                },
                () => {}
              )
              .catch((reason: any) => {
                console.error(reason);
                this.signUpMessageFail = `${reason}! Please email us at support@maptio.com and we'll help you out. `;
                this.cd.markForCheck();
              });
          }
        })
        .then(() => {
          this.loaderService.hide();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  isEmailExist(email: string): Promise<boolean> {
    return this.userService.isUserExist(email);
  }

  isActivationPending(email: string, firstname: string, lastname: string) {
    return this.userService
      .isActivationPendingByEmail(email)
      .then(({ isActivationPending, user_id }) => {
        if (!user_id) {
          return Promise.resolve({
            isActivationPending: false,
            userToken: undefined,
          });
        }
        // if (isActivationPending) {
        return this.userService
          .generateUserToken(user_id, email, firstname, lastname)
          .then((token) => {
            return { isActivationPending, userToken: token };
          });
        // }
      });
  }

  resendEmail() {
    this.isResending = true;
    this.isConfirmationEmailSent = false;
    if (!this.userToken) return;
    this.userService.sendConfirmationWithUserToken(this.userToken).then(() => {
      this.isResending = false;
      this.isConfirmationEmailSent = true;
      this.cd.markForCheck();
    });
  }

  resendImmediately() {
    this.isResending = true;
    // this.isConfirmationEmailSent=false;
    this.userService
      .sendConfirmation(
        this.email,
        this.userId,
        this.firstname,
        this.lastname,
        ''
      )
      .then(() => {
        this.isResending = false;
        // this.isConfirmationEmailSent=true;
        this.cd.markForCheck();
      });
  }
}
