import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from "@angular/forms";

import { Subscription } from "rxjs";

import { Role } from "../../../../../../../shared/model/role.data";
import { Helper } from "../../../../../../../shared/model/helper.data";
import { RoleLibraryService } from "../../../../../services/role-library.service";


const eitherTitleOrDescriptionProvided: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const title = control.get("title");
    const description = control.get("description");

    const isValid = title && description && (title.value && title.value.trim() || description.value && description.value.trim());

    return isValid ? null : { neitherTitleNorDescriptionProvided: true };
};

const noWhitespaceValidator: ValidatorFn = (control: FormControl): ValidationErrors | null => {
    const isWhitespace = (control.value || "").trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { "whitespace": true };
}


@Component({
    selector: "initiative-helper-role-input",
    templateUrl: "./helper-role-input.component.html",
    styleUrls: ["./helper-role-input.component.css"],
})
export class InitiativeHelperRoleInputComponent implements OnInit, OnDestroy {
    @Input("role") role: Role;
    @Input("helper") helper: Helper;
    @Input("isDirectoryView") isDirectoryView: boolean = false;

    @Output("cancel") cancel = new EventEmitter<void>();
    @Output("save") save = new EventEmitter<void>();

    roleForm: FormGroup;
    title = new FormControl();
    description = new FormControl();
    saveAsLibraryRole = new FormControl();
    isAlreadySavedInLibrary = false;

    saveAsLibraryRoleSubscription: Subscription;

    isEditMode = false;
    isSubmissionAttempted = false;

    constructor(private cd: ChangeDetectorRef, private roleLibrary: RoleLibraryService) {
        this.roleForm = new FormGroup({
            title: this.title,
            description: this.description,
            saveAsLibraryRole: this.saveAsLibraryRole,
        });
    }

    ngOnInit(): void {
        this.saveAsLibraryRoleSubscription = this.saveAsLibraryRole.valueChanges.subscribe(newSaveAsLibraryRoleValue => {
            this.setValidatorsDependingOnRoleType(newSaveAsLibraryRoleValue);
        });
    }

    ngOnDestroy(): void {
        if (this.saveAsLibraryRoleSubscription) this.saveAsLibraryRoleSubscription.unsubscribe();
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
        return this.roleForm.errors && this.roleForm.errors.neitherTitleNorDescriptionProvided && this.isSubmissionAttempted;
    }

    showTitleFieldError() {
        const isDirtyOrTouched = (this.title.dirty || this.title.touched);
        return (this.saveAsLibraryRole.value && this.title.invalid && (isDirtyOrTouched || this.isSubmissionAttempted)) ||
            this.showNeitherTitleNorDescriptionProvidedError();
    }

    showDescriptionFieldError() {
        return this.showNeitherTitleNorDescriptionProvidedError();
    }

    setValidatorsDependingOnRoleType(saveAsLibraryRole: boolean) {
        if (saveAsLibraryRole) {
            // No cross-field validation is necessary for library roles
            this.roleForm.setValidators([]);

            // Title is required for library roles
            this.title.setValidators([Validators.required, noWhitespaceValidator])
            this.title.updateValueAndValidity();
        } else {
            // Ensure that at least one of either role or description is populated for custom roles
            this.roleForm.setValidators([eitherTitleOrDescriptionProvided]);

            // Title is optional for custom roles
            this.title.setValidators([])
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

        if (this.saveAsLibraryRole.value && this.role.isCustomRole()) {
            this.role.convertToLibraryRole();
            this.roleLibrary.addRoleToLibrary(this.role);
        }

        if (this.saveAsLibraryRole.value && this.role.isLibraryRole()) {
            this.roleLibrary.editRole(this.role);
        }

        if (!this.saveAsLibraryRole.value && this.role.isLibraryRole()) {
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
