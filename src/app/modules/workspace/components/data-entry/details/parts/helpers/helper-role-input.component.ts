import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from '@angular/core';
// import { Helper } from '../../../../../../../shared/model/helper.data';
// import { Team } from '../../../../../../../shared/model/team.data';
import { Role } from '../../../../../../../shared/model/role.data';

@Component({
    selector: 'initiative-helper-role-input',
    templateUrl: './helper-role-input.component.html',
})
export class InitiativeHelperRoleInputComponent implements OnInit {
    // @Input("helper") helper: Helper;
    @Input("role") role: Role;
    @Input("roleIndex") roleIndex: number;
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
    isDescriptionVisible: boolean;
    isEditMode = true;
    saveAsLibraryRole: boolean;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.saveAsLibraryRole = this.role.shortid ? true : false;
    }

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
}
