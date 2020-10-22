import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";

import { Role } from "../../../../../../../shared/model/role.data";


@Component({
    selector: "initiative-helper-role",
    templateUrl: "./helper-role.component.html",
    styleUrls: ["./helper-role.component.css"],
})
export class InitiativeHelperRoleComponent {
    @Input("role") role: Role;
    @Input("showControls") showControls: boolean;

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
        this.isDescriptionVisible = titleValue ? false : true;
    }

    onEdit() {
        this.edit.emit(this.role);
    }

    onRemove() {
        this.remove.emit(this.role);
    }
}
