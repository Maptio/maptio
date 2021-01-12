import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from "@angular/core";
import { Role } from "../../../../../../../shared/model/role.data";

@Component({
    selector: "initiative-vacancies-input",
    templateUrl: "./vacancies-input.component.html",
    styleUrls: ["./vacancies-input.component.css"],
})
export class InitiativeVacanciesInputComponent implements OnInit {
    @Input("vacancies") vacancies: Role[];
    @Input("summaryUrlRoot") summaryUrlRoot: string;
    @Input("isUnauthorized") isUnauthorized: boolean;

    // @Output("remove") remove: EventEmitter<Helper> = new EventEmitter<Helper>();
    @Output("save") save: EventEmitter<void> = new EventEmitter<void>();

    cancelClicked: boolean;
    isPickRoleMode = false;
    isCreateRoleMode = false;
    isEditRoleMode = false;

    newRole: Role;
    roleBeingEdited: Role;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges){
        if (changes.vacancies && changes.vacancies.currentValue) {
            this.isPickRoleMode = false;

            this.isCreateRoleMode = false;
            this.newRole = undefined;

            this.isEditRoleMode = false;
            this.roleBeingEdited = undefined;
        }
    }

    // onRemove() {
    //     this.remove.emit(this.helper);
    // }

    onPickRole(roles: Role[]) {
        this.isPickRoleMode = false;
        this.vacancies = this.sortRoles(roles);
        this.save.emit();
        this.cd.markForCheck();
    }

    onCreateRole(newRole: Role) {
        this.isPickRoleMode = false;
        this.isCreateRoleMode = true;
        this.newRole = newRole;
        this.cd.markForCheck();
    }

    onCancelCreatingNewRole() {
        this.isCreateRoleMode = false;
        this.newRole = undefined;
        this.cd.markForCheck();
    }

    onSaveNewRole() {
        this.vacancies.unshift(this.newRole);
        this.vacancies = this.sortRoles(this.vacancies);
        this.isCreateRoleMode = false;
        this.newRole = undefined;
        this.save.emit();
        this.cd.markForCheck();
    }

    onEditRole(role: Role) {
        this.roleBeingEdited = role;
        this.isEditRoleMode = true;
    }

    onCancelEditingRole() {
        this.roleBeingEdited = undefined;
        this.isEditRoleMode = false;
    }

    onChangeRole() {
        this.onCancelEditingRole();
        this.vacancies = this.sortRoles(this.vacancies);
        this.save.emit();
        this.cd.markForCheck();
    }

    onRemoveRole(roleToBeRemoved: Role) {
        this.vacancies = this.vacancies.filter(role => role !== roleToBeRemoved)
        this.save.emit();
        this.cd.markForCheck();
    }

    sortRoles(roles: Role[]): Role[] {
        return roles.sort((a, b) => {
            // Make sure that roles without titles end up at the bottom of the list
            if (!a.hasTitle() && b.hasTitle()) {
                return 1;
            }

            if (a.hasTitle() && !b.hasTitle()) {
                return -1;
            }

            // Sort the remaining roles by title
            if (a.hasTitle() && b.hasTitle()) {
                const aTitle = a.title.toLowerCase();
                const bTitle = b.title.toLowerCase();

                if (aTitle > bTitle) {
                    return 1;
                }

                if (aTitle < bTitle) {
                    return -1;
                }
            }

            return 0;
        });
    }
}
