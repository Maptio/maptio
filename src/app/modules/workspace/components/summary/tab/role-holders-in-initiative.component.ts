import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Initiative } from '../../../../../shared/model/initiative.data';
import { Router } from '@angular/router';
import { DataSet } from '../../../../../shared/model/dataset.data';
import { Team } from '../../../../../shared/model/team.data';
import { User } from '../../../../../shared/model/user.data';
import { Helper } from '../../../../../shared/model/helper.data';
import { Role } from "../../../../../shared/model/role.data";
import { sortBy } from 'lodash';
import { RoleLibraryService } from '../../../services/role-library.service';

@Component({
    selector: 'role-holders-in-initiative',
    templateUrl: './role-holders-in-initiative.component.html',
    styleUrls: ['./role-holders-in-initiative.component.css']
})
export class RoleHoldersInInitiativeComponent implements OnInit {
    @Input("initiative") initiative: Initiative;
    @Input("role") role: Role;
    @Input("team") team: Team;
    @Input("datasetId") public datasetId: string;
    @Output("selectMember") selectMember: EventEmitter<User> = new EventEmitter<User>();
    @Output("selectInitiative") selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();

    isShowRoles: boolean;
    roleHolders: Helper[];

    constructor(private router: Router, private roleLibrary: RoleLibraryService) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        let recalculateRoleHolders = false;

        if (changes.initiative && changes.initiative.currentValue) {
            this.initiative = changes.initiative.currentValue;
            recalculateRoleHolders = true;
        }

        if (changes.role && changes.role.currentValue) {
            this.role = changes.role.currentValue;
            recalculateRoleHolders = true;
        }

        if (recalculateRoleHolders) {
            this.getRoleHolders();
        }
    }

    getRoleHolders() {
        const accountable = this.initiative.accountable;
        this.roleHolders = [];

        this.roleHolders = this.sortHelpers()
            .map((helper) => {
                return helper && this.doesHelperHaveRole(helper, this.role) ? helper : undefined;
            })
            .filter(helper => helper);

        // Put the lead in first place if they have the role
        if (accountable && this.doesHelperHaveRole(accountable, this.role)) {
            this.roleHolders.unshift(accountable);
        }

        if (!this.roleHolders) {
            console.error('No holders for given role in given initiative.');
        }
    }

    doesHelperHaveRole(helper: Helper, role: Role) {
        return helper && helper.roles && this.roleLibrary.findRoleInList(role, helper.roles) ? true : false;
    }

    openInitiative(node: Initiative) {
        this.selectInitiative.emit(node);
    }

    onSelectMember(user: User) {
        this.selectMember.emit(user);
    }

    getWithDescriptionId() {
        return `with-description-${this.initiative.id}`
    }

    getNoDescriptionId() {
        return `no-description-${this.initiative.id}`
    }

    getMultipleCollapseId() {
        return `with-description-${this.initiative.id} no-description-${this.initiative.id}`
    }

    getMultipleCollapseClass() {
        return `multi-collapse-${this.initiative.id}`
    }

    sortHelpers() {
        return sortBy(this.initiative.helpers, h => h.name)
    }
}
