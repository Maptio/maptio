import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from "@angular/core";
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from "@angular/forms";

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
export class InitiativeHelperRoleInputComponent implements OnInit {
    @Input("role") role: Role;
    @Input("helper") helper: Helper;

    @Output("cancel") cancel = new EventEmitter<void>();
    @Output("save") save = new EventEmitter<void>();

    roleForm: FormGroup;
    title = new FormControl();
    description = new FormControl();
    saveAsLibraryRole = new FormControl();
    isAlreadySavedInLibrary = false;

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
        this.saveAsLibraryRole.valueChanges.subscribe(newSaveAsLibraryRoleValue => {
            this.setValidatorsDependingOnRoleType(newSaveAsLibraryRoleValue);
        });
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

// import { Helper } from '../../../../../../../shared/model/helper.data';
// import { Team } from '../../../../../../../shared/model/team.data';

    // @Input("helper") helper: Helper;
    // @Input("team") team: Team;
    // @Input("summaryUrlRoot") summaryUrlRoot: string;
    // @Input("isAuthority") isAuthority: boolean;
    // @Input("isUnauthorized") isUnauthorized:boolean;

    // @Output("remove") remove: EventEmitter<Helper> = new EventEmitter<Helper>();
    // @Output("save") save :EventEmitter<void> = new EventEmitter<void>();

    // placeholder:string;
    // cancelClicked:boolean;
    // hasRole:boolean;
    // isEditRoleToggled:boolean;
    // isEmptyRole:boolean;

    // ngOnChanges(changes:SimpleChanges){
    //     if(changes.helper && changes.helper.currentValue){
    //         this.placeholder = `How is ${changes.helper.currentValue.name} helping?`
    //         this.hasRole = (changes.helper.currentValue as Helper).roles 
    //         && (changes.helper.currentValue as Helper).roles[0] 
    //         && !!(changes.helper.currentValue as Helper).roles[0].description;
    //         this.isEditRoleToggled = this.hasRole;
    //         if(this.isAuthority) this.helper.hasAuthorityPrivileges = true;
    //         this.isEmptyRole = !(this.helper.roles && this.helper.roles[0] && this.helper.roles[0].description.trim().length >0); 
    //     }
    // }

    // onRemove() {
    //     this.remove.emit(this.helper);
    // }

    // onChangePrivilege(helper: Helper, hasAuthorityPrivileges: boolean) {
    //     this.helper.hasAuthorityPrivileges = hasAuthorityPrivileges;
    //     this.save.emit();
    //     this.cd.markForCheck();
    // }

    // onChangeRole(description: string) {
    //     if (this.helper.roles[0]) {
    //         this.helper.roles[0].description = description;
    //     }
    //     else {
    //         this.helper.roles[0] = new Role({ description: description })
    //     }
    //     this.save.emit();
    //     this.cd.markForCheck();
    // }
