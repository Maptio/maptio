import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Intercom } from 'ng-intercom';
import { Angulartics2Mixpanel } from 'angulartics2/mixpanel';

import { environment } from '@maptio-environment';
import { DatasetFactory } from '@maptio-core/http/map/dataset.factory';
import { DataSet } from '@maptio-shared/model/dataset.data';
import { User, MemberFormFields } from '@maptio-shared/model/user.data';
import { Team } from '@maptio-shared/model/team.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { UserFactory } from '@maptio-core/http/user/user.factory';
import { TeamFactory } from '@maptio-core/http/team/team.factory';


@Component({
  selector: 'maptio-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss'],
})
export class MemberFormComponent implements OnInit {
  TERMS_AND_CONDITIONS_URL = environment.TERMS_AND_CONDITIONS_URL;
  PRIVACY_POLICY_URL = environment.PRIVACY_POLICY_URL;

  public newMember: User;
  public errorMessage: string;

  public createdUser: User;
  public memberForm: FormGroup;

  private firstname: string;
  private lastname: string;
  private email: string;

  public picture: string;
  public memberId: string;
  public imageUploadErrorMessage = '';

  public isUserSignUp = false;
  public isEditingExistingUser = false;

  public isNewImageUploaded = false;
  public isSubmissionAttempted = false;
  public isSaving: boolean;
  public savingFailedMessage = null;
  public isSavingSuccess = false;

  public isDeduplicationTriggeredInternally = false;

  @Input() member: User | MemberFormFields;
  @Input() team: Team;
  @Input() splitName = false;
  @Input() showCancelButton = false;
  @Input() disableEmailInput = false;
  @Input() disableDeduplication = false;
  @Input() duplicateUsers: User[] = [];
  @Input() isProfilePage = false;
  @Output() addMember = new EventEmitter<User>();
  @Output() editMember = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor(
    private cd: ChangeDetectorRef,
    private router: Router,
    private datasetFactory: DatasetFactory,
    private userFactory: UserFactory,
    private teamFactory: TeamFactory,
    private userService: UserService,
    private analytics: Angulartics2Mixpanel,
    private intercom: Intercom,
  ) {}

  ngOnInit(): void {
    this.memberForm = new FormGroup({
      firstname: new FormControl(
        '',
        { validators: [ Validators.required, Validators.minLength(2) ] }
      ),
      lastname: new FormControl('', { validators: [ Validators.minLength(2) ] }),
      email: new FormControl('', { validators: [ Validators.email ] }),
    });

    if (this.member) {
      // Ugly workaround for when we get the first name from an autocomplete
      // name input in the circle details panel. This is meant to be replaced
      // in the future by a single name field!
      if (this.splitName) {
        const [firstWord, ...remainingWords] = this.member.firstname.split(' ').filter(Boolean);
        this.memberForm.controls['firstname'].setValue(firstWord);
        this.memberForm.controls['lastname'].setValue(remainingWords.join(' '));
      } else {
        this.memberForm.controls['firstname'].setValue(this.member.firstname);
        this.memberForm.controls['lastname'].setValue(this.member.lastname);
      }

      this.memberForm.controls['email'].setValue(this.member.email);

      this.picture = this.member.picture;
    }

    if (this.member instanceof User) {
      this.isEditingExistingUser = true;
      this.memberId = this.member.user_id;
    }

    // Email shouldn't be editable once a team member is already in Auth0
    if (this.disableEmailInput || (this.member instanceof User && this.member.isInAuth0)) {
      this.memberForm.get('email').disable();
    }

    // Not adding a member to a team, but creating a user via sign up
    if (!this.team && !this.isProfilePage) {
      this.isUserSignUp = true;

      this.memberForm.addControl(
        'isTermsAccepted',
        new FormControl(false, { validators: [ Validators.requiredTrue ] }),
      )
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.memberForm.get(fieldName);

    const isDirtyOrTouched = field.dirty || field.touched;
    const isDirtyOrTouchedAfterSubmission = isDirtyOrTouched && this.isSubmissionAttempted;

    return (isDirtyOrTouchedAfterSubmission || this.isSubmissionAttempted) && field.invalid;
  }

  onImageUpload(imageUrl: string) {
    this.isNewImageUploaded = true;
    this.picture = imageUrl;
    this.imageUploadErrorMessage = '';
  }

  onImageUploadError(errorMessage: string) {
    this.imageUploadErrorMessage = errorMessage;
  }

  async save(performDeduplication = true) {
    if (!this.memberForm.valid) {
      this.isSubmissionAttempted = true;
      return;
    }

    this.firstname = this.memberForm.controls['firstname'].value;
    this.lastname = this.memberForm.controls['lastname'].value;
    this.email = this.memberForm.controls['email'].value;

    if (
      performDeduplication
      && !this.disableDeduplication
      && !this.isEditingExistingUser
      && !this.isUserSignUp
    ) {
      this.duplicateUsers = await this.checkForDuplicateTeamMembers();

      if (this.duplicateUsers.length) {
        this.isDeduplicationTriggeredInternally = true;
        return;
      }
    }

    this.isSaving = true;

    if (this.isEditingExistingUser && !this.isUserSignUp) {
      await this.updateUser();
    } else if (this.isEditingExistingUser && this.isUserSignUp) {
      await this.updateUser(this.isUserSignUp);
      this.router.navigateByUrl('/home');
    } else {
      await this.createUserAndAddToTeam();
    }

    this.isSubmissionAttempted = false;
    this.isSaving = false;
    this.cd.markForCheck();
  }

  private async checkForDuplicateTeamMembers() {
    return this.userService.checkForDuplicateTeamMembers(
      this.team,
      this.email,
      this.firstname,
      this.lastname,
    );
  }

  private async createUserAndAddToTeam() {
    await this.createUserFullDetails();

    this.addMember.emit(this.createdUser);
    this.reset();
  }

  private async createUserFullDetails() {
    this.createdUser = this.userService.createUserFromMemberForm(
      this.email,
      this.firstname,
      this.lastname,
      this.picture,
    );

    return this.datasetFactory.get(this.team)
      .then((datasets: DataSet[]) => {
        this.createdUser.teams = [this.team.team_id];
        this.createdUser.datasets = datasets.map((d) => d.datasetId);

        return this.createdUser;
      },
      (reason) => {
        return Promise.reject(`Can't create ${this.email} : ${reason}`);
      })
      .then((user: User) => {
        this.userFactory.create(user);
        return user;
      })
      .then((user: User) => {
        this.team.members.push(user);
        this.teamFactory.upsert(this.team).then(() => {
          this.newMember = undefined;
        });
      })
      .then(() => {
        this.analytics.eventTrack('Team', {
          action: 'create',
          team: this.team.name,
          teamId: this.team.team_id,
        });
        return true;
      })
      .then(() => {
        this.intercom.trackEvent('Create user', {
          team: this.team.name,
          teamId: this.team.team_id,
          email: this.email,
        });
        return true;
      })
      .catch((reason) => {
        console.error(reason);
        this.errorMessage = reason;
        throw Error(reason);
      });
  }

  private async updateUser(setAsActivated?: boolean) {
    this.savingFailedMessage = null;
    this.isSavingSuccess = false;
    this.cd.markForCheck();

    if (!(this.member instanceof User)) {
      return;
    }

    try {
      if (setAsActivated) {
        this.isSavingSuccess = await this.userService.updateUser(
          this.member,
          this.firstname,
          this.lastname,
          this.email,
          this.picture,
          false,
        );
      } else {
        this.isSavingSuccess = await this.userService.updateUser(
          this.member,
          this.firstname,
          this.lastname,
          this.email,
          this.picture,
        );
      }
    } catch (error) {
      this.isSavingSuccess = false;
      this.savingFailedMessage = `Updating profile information failed with
        error: "${error.message}", please try again later or contact us.`;
      console.error(this.savingFailedMessage, error);
    }

    if (!this.isSavingSuccess) {
      this.isSavingSuccess = false;

      if (!this.savingFailedMessage) {
        this.savingFailedMessage = 'Cannot update profile information, please try again later or contact us.';
      }

      return;
    }

    this.member.firstname = this.firstname;
    this.member.lastname = this.lastname;
    this.member.name = `${this.firstname} ${this.lastname}`;
    this.member.email = this.email;

    this.editMember.emit();
    this.isSavingSuccess = true;
  }

  onCancel() {
    this.cancel.emit();
  }

  onCancelDeduplication() {
    this.duplicateUsers = [];
  }

  onIgnoreDeduplicationWarning() {
    this.onCancelDeduplication();

    // Run save method again, this time without performing deduplication
    this.save(false);
  }

  async onMergeDuplicateUsers() {
    if (!(this.member instanceof User)) {
      this.errorMessage = `
        The application encountered an unexpected input error while attempting
        user de-duplication. Please contact us for help and quote this error
        message.
      `;
      console.error(`
        Attempting to replace a MemberFormFields object with a duplicate user.
        This is unexpected and something must have gone wrong, this function
        should only be run with a User object.
      `);
      return;
    }

    try {
      await this.userService.replaceUserWithDuplicateAlreadyInAuth0(
        this.duplicateUsers,
        this.member,
        this.team
      );
    } catch(error) {
      console.error('Error while attempting to replace user with duplicate', error);
      this.errorMessage = `
        The application encountered an unexpected error while attempting user
        de-duplication. Please contact us for help and quote this error
        message.
      `;
    }
  }

  onChooseMemberViaDeduplication(member: User) {
    this.addMember.emit(member);
    this.reset();
  }

  private reset() {
    this.imageUploadErrorMessage = '';
    this.errorMessage = '';
    this.picture = '';
    this.duplicateUsers = [];
    this.isDeduplicationTriggeredInternally = false;
    this.memberForm.reset();
  }
}
