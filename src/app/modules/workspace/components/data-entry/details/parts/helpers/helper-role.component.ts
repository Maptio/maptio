import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";

import { Role } from "../../../../../../../shared/model/role.data";


@Component({
    selector: "initiative-helper-role",
    templateUrl: "./helper-role.component.html",
    styleUrls: ["./helper-role.component.css"],
})
export class InitiativeHelperRoleComponent {
    @Input("role") role: Role;
    @Input("closed") closed: Role;
    @Input("showControls") showControls: boolean;
    @Input("isDirectoryView") isDirectoryView: boolean = false;

    @Output("edit") edit = new EventEmitter<Role>();
    @Output("remove") remove = new EventEmitter<Role>();

    isDescriptionVisible = false;

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.role && changes.role.currentValue) {
            const newRoleValue = changes.role.currentValue as Role;
            this.expandToShowDescriptionIfNoTitlePresent(newRoleValue.title);
        }
    }

    /**
     * Roles without titles should be expanded to show the description
     */
    expandToShowDescriptionIfNoTitlePresent(titleValue?: string) {
        if (this.closed) {
            this.isDescriptionVisible = false;
        } else {
            this.isDescriptionVisible = titleValue ? false : true;
        }
    }

    getRemoveWarning() {
        if (this.isDirectoryView) {
            return  'This will remove the role from ALL holders in the organisation and delete it ' + 
                'from the list of roles. This cannot be undone. Are you sure?';
        } else {
            return 'Remove role? (This does not affect other holders of this role)';
        }
    }

    onEdit() {
        this.edit.emit(this.role);
    }

    onRemove() {
        this.remove.emit(this.role);
    }
}
