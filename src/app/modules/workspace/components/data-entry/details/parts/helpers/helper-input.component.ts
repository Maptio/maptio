import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from "@angular/core";
import { Helper } from "../../../../../../../shared/model/helper.data";
import { Team } from "../../../../../../../shared/model/team.data";
import { Role } from "../../../../../../../shared/model/role.data";

@Component({
    selector: "initiative-helper-input",
    templateUrl: "./helper-input.component.html",
    // styleUrls: ["./helper-input.component.css"]
})
export class InitiativeHelperInputComponent implements OnInit {
    @Input("helper") helper: Helper;
    @Input("team") team: Team;
    @Input("summaryUrlRoot") summaryUrlRoot: string;
    @Input("isAuthority") isAuthority: boolean;
    @Input("isUnauthorized") isUnauthorized: boolean;

    @Output("remove") remove: EventEmitter<Helper> = new EventEmitter<Helper>();
    @Output("save") save: EventEmitter<void> = new EventEmitter<void>();

    cancelClicked: boolean;
    isPickRoleMode = false;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void { }

    ngOnChanges(changes:SimpleChanges){
        if (changes.helper && changes.helper.currentValue) {
            if (this.isAuthority) this.helper.hasAuthorityPrivileges = true;
        }
    }

    onRemove() {
        this.remove.emit(this.helper);
    }

    onChangePrivilege(helper: Helper, hasAuthorityPrivileges: boolean) {
        this.helper.hasAuthorityPrivileges = hasAuthorityPrivileges;
        this.save.emit();
        this.cd.markForCheck();
    }

    onRolePick(roles: Role[]) {
        this.isPickRoleMode = false;
        this.helper.roles = roles;
        this.save.emit();
        this.cd.markForCheck();
    }

    onRemoveRole(roleToBeRemoved: Role) {
        this.helper.roles = this.helper.roles.filter(role => role !== roleToBeRemoved)
        this.save.emit();
        this.cd.markForCheck();
    }

    onChangeRole() {
        this.save.emit();
        this.cd.markForCheck();
    }

}
