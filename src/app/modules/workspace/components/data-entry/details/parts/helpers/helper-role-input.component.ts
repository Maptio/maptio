import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { Role } from "../../../../../../../shared/model/role.data";

@Component({
    selector: "initiative-helper-role-input",
    templateUrl: "./helper-role-input.component.html",
    styleUrls: ["./helper-role-input.component.css"],
})
export class InitiativeHelperRoleInputComponent implements OnInit {
    @Input("role") role: Role;
    @Input("roleIndex") roleIndex: number;

    @Output("save") save = new EventEmitter<void>();
    @Output("remove") remove = new EventEmitter<Role>();

    roleForm: FormGroup;
    title = new FormControl();
    description = new FormControl();
    saveAsLibraryRole = new FormControl();

    isDescriptionVisible = false;
    isEditMode = false;
    // saveAsLibraryRole: boolean;

    constructor(private cd: ChangeDetectorRef) {
        this.roleForm = new FormGroup({
            title: this.title,
            description: this.description,
            saveAsLibraryRole: this.saveAsLibraryRole,
        });
    }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.role && changes.role.currentValue) {
            const newRoleValue = changes.role.currentValue;
            const saveAsLibraryRoleValue = newRoleValue.shortid ? true : false;

            // Patching value rather than setting value as title and description are optional
            this.roleForm.patchValue({
                title: newRoleValue.title,
                description: newRoleValue.description,
                saveAsLibraryRole: saveAsLibraryRoleValue,
            });
            this.cd.markForCheck();

            // Roles without titles should be expanded to show the description
            if (!newRoleValue.title) {
                this.isDescriptionVisible = true;
            }
        }
    }

    onRemove() {
        this.remove.emit(this.role);
    }

    onSave() {
        this.isEditMode = false;

        this.role.title = this.title.value;
        this.role.description = this.description.value;

        if (this.saveAsLibraryRole.value) {
            console.log("TODO: Save shortid!")
        }

        this.save.emit();
        this.cd.markForCheck();
    }

    onCancel() {
        this.isEditMode = false;
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
