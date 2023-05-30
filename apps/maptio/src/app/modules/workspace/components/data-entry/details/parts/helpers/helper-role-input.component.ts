import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, ValidatorFn, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';

import { environment } from '@maptio-config/environment';

import { Role } from '../../../../../../../shared/model/role.data';
import { Helper } from '../../../../../../../shared/model/helper.data';
import { RoleLibraryService } from '../../../../../services/role-library.service';
import { MapService } from '@maptio-shared/services/map/map.service';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';

const eitherTitleOrDescriptionProvided: ValidatorFn = (
  control: UntypedFormGroup
): ValidationErrors | null => {
  const title = control.get('title');
  const description = control.get('description');

  const isValid =
    title &&
    description &&
    ((title.value && title.value.trim()) ||
      (description.value && description.value.trim()));

  return isValid ? null : { neitherTitleNorDescriptionProvided: true };
};

const noWhitespaceValidator: ValidatorFn = (
  control: UntypedFormControl
): ValidationErrors | null => {
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { whitespace: true };
};

@Component({
    selector: 'initiative-helper-role-input',
    templateUrl: './helper-role-input.component.html',
    styleUrls: ['./helper-role-input.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, NgIf, NgbTooltipModule, ConfirmationPopoverModule]
})
export class InitiativeHelperRoleInputComponent implements OnInit, OnDestroy {
  @Input('role') role: Role;
  @Input('helper') helper: Helper;
  @Input('isVacancy') isVacancy = false;
  @Input('isDirectoryView') isDirectoryView = false;

  @Output('cancel') cancel = new EventEmitter<void>();
  @Output('save') save = new EventEmitter<void>();

  KB_URL_ROLE_TYPES = environment.KB_URL_ROLE_TYPES;
  KB_URL_MARKDOWN = environment.KB_URL_MARKDOWN;

  roleForm: UntypedFormGroup;
  title = new UntypedFormControl();
  description = new UntypedFormControl();
  saveAsLibraryRole = new UntypedFormControl();
  isAlreadySavedInLibrary = false;

  saveAsLibraryRoleSubscription: Subscription;

  isEditMode = false;
  isSubmissionAttempted = false;

  constructor(
    private cd: ChangeDetectorRef,
    private roleLibrary: RoleLibraryService,
    private mapService: MapService
  ) {
    this.roleForm = new UntypedFormGroup({
      title: this.title,
      description: this.description,
      saveAsLibraryRole: this.saveAsLibraryRole,
    });
  }

  ngOnInit(): void {
    this.saveAsLibraryRoleSubscription =
      this.saveAsLibraryRole.valueChanges.subscribe(
        (newSaveAsLibraryRoleValue) => {
          this.setValidatorsDependingOnRoleType(newSaveAsLibraryRoleValue);
        }
      );
  }

  ngOnDestroy(): void {
    if (this.saveAsLibraryRoleSubscription)
      this.saveAsLibraryRoleSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.role && changes.role.currentValue) {
      const newRoleValue = changes.role.currentValue as Role;

      this.isAlreadySavedInLibrary = newRoleValue.isLibraryRole();
      this.setValidatorsDependingOnRoleType(this.isAlreadySavedInLibrary);

      // Patching rather than setting value as title and description are optional
      this.roleForm.patchValue({
        title: newRoleValue.title,
        description: newRoleValue.description,
        saveAsLibraryRole: this.isAlreadySavedInLibrary,
      });
    }
  }

  showDeleteButton() {
    return this.saveAsLibraryRole.value && this.role.isLibraryRole();
  }

  showNeitherTitleNorDescriptionProvidedError() {
    return (
      this.roleForm.errors &&
      this.roleForm.errors.neitherTitleNorDescriptionProvided &&
      this.isSubmissionAttempted
    );
  }

  showTitleFieldError() {
    const isDirtyOrTouched = this.title.dirty || this.title.touched;
    return (
      ((this.saveAsLibraryRole.value || this.isDirectoryView) &&
        this.title.invalid &&
        (isDirtyOrTouched || this.isSubmissionAttempted)) ||
      this.showNeitherTitleNorDescriptionProvidedError()
    );
  }

  showDescriptionFieldError() {
    return this.showNeitherTitleNorDescriptionProvidedError();
  }

  getCustomRoleInputId() {
    const suffix = this.isVacancy ? 'vacancy' : this.helper.shortid;
    return 'customRoleRadio-' + suffix;
  }

  getLibraryRoleInputId() {
    const suffix = this.isVacancy ? 'vacancy' : this.helper.shortid;
    return 'libraryRoleRadio-' + suffix;
  }

  setValidatorsDependingOnRoleType(saveAsLibraryRole: boolean) {
    if (saveAsLibraryRole || this.isDirectoryView) {
      // No cross-field validation is necessary for library roles
      this.roleForm.setValidators([]);

      // Title is required for library roles
      this.title.setValidators([Validators.required, noWhitespaceValidator]);
      this.title.updateValueAndValidity();
    } else {
      // Ensure that at least one of either role or description is populated for custom roles
      this.roleForm.setValidators([eitherTitleOrDescriptionProvided]);

      // Title is optional for custom roles
      this.title.setValidators([]);
    }
  }

  onDelete() {
    this.roleLibrary.deleteRoleFromLibrary(this.role);
    this.cancel.emit();
  }

  onSave() {
    if (!this.roleForm.valid) {
      this.isSubmissionAttempted = true;
      return;
    }

    this.role.title = this.title.value;
    this.role.description = this.description.value;

    if (
      (this.saveAsLibraryRole.value || this.isDirectoryView) &&
      this.role.isCustomRole()
    ) {
      this.role.convertToLibraryRole();
      this.mapService.setNextSaveAsMultisaveOperation();
      this.roleLibrary.addRoleToLibrary(this.role);
    } else if (this.saveAsLibraryRole.value && this.role.isLibraryRole()) {
      this.mapService.setNextSaveAsMultisaveOperation();
      this.roleLibrary.editRole(this.role);
    }

    if (
      !(this.saveAsLibraryRole.value || this.isDirectoryView) &&
      this.role.isLibraryRole()
    ) {
      this.role.convertToCustomRole();
    }

    this.save.emit();

    this.isSubmissionAttempted = false;
    this.cd.markForCheck();
  }

  onCancel() {
    this.cancel.emit();
  }
}
