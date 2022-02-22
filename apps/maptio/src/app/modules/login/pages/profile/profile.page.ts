import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { Auth } from '@maptio-core/authentication/auth.service';
import { UserFactory } from '@maptio-core/http/user/user.factory';
import { User } from '@maptio-shared/model/user.data';
import { UserRole } from '@maptio-shared/model/permission.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { ErrorService } from '@maptio-shared/services/error/error.service';
import { LoaderService } from '@maptio-shared/components/loading/loader.service';


@Component({
  selector: 'maptio-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.css'],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  public user: User;
  public subscription: Subscription;
  public accountForm: FormGroup;
  public errorMessage: string;
  public feedbackMessage: string;

  public firstname: string;
  public lastname: string;

  user$ = this.userService.user$;

  constructor(
    public auth: Auth,
    public errorService: ErrorService,
    private userService: UserService,
    private userFactory: UserFactory,
    private loaderService: LoaderService
  ) {
    this.accountForm = new FormGroup({
      firstname: new FormControl(this.firstname, {
        validators: [Validators.required],
        updateOn: 'submit',
      }),
      lastname: new FormControl(this.firstname, {
        validators: [Validators.required],
        updateOn: 'submit',
      }),
    });
  }

  ngOnInit() {
    this.loaderService.show();
    this.subscription = this.auth.getUser().subscribe(
      (user: User) => {
        this.user = user;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
        this.loaderService.hide();
      },
      (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        this.errorService.handleError(error);
      },
      () => {
        this.loaderService.hide();
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  save() {
    this.feedbackMessage = null;
    if (this.accountForm.dirty && this.accountForm.valid) {
      const firstname = this.accountForm.controls['firstname'].value;
      const lastname = this.accountForm.controls['lastname'].value;

      this.userService
        .updateUserProfilePlaceholder(this.user.user_id, firstname, lastname)
        .then(
          (hasUpdated: boolean) => {
            if (hasUpdated) {
              this.auth.getUser();
              this.feedbackMessage = 'Successfully updated.';
            } else return Promise.reject("Can't update your user information.");
          },
          (reason) => {
            return Promise.reject(reason);
          }
        )
        .then(() => {
          this.user.firstname = firstname;
          this.user.lastname = lastname;
          return this.userFactory.upsert(this.user).then(
            (hasUpdated) => {
              if (!hasUpdated)
                return Promise.reject('Cannot sync your user information');
            },
            () => {
              return Promise.reject('Cannot sync your user information');
            }
          );
        })
        .then(() => {
          this.accountForm.reset();
        })
        .catch((reason) => {
          this.errorMessage = reason;
        });
    } else {
      this.feedbackMessage = 'Successfully updated.';
    }
  }
}
