import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Initiative } from '../../../../../shared/model/initiative.data';
import { Router } from '@angular/router';
import { DataSet } from '../../../../../shared/model/dataset.data';
import { Team } from '../../../../../shared/model/team.data';
import { User } from '../../../../../shared/model/user.data';
import { sortBy } from 'lodash';

@Component({
    selector: 'personal-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css']
})
export class PersonalCardComponent implements OnInit {

    @Input("initiative") initiative: Initiative;
    @Input("team") team: Team;
    @Input("datasetId") public datasetId: string;
    @Input("isWithLeader") isWithLeader: boolean;
    @Input("selectedMemberId") selectedMemberId: string;
    @Output("selectMember") selectMember: EventEmitter<User> = new EventEmitter<User>();
    @Output("selectInitiative") selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();

    isShowRoles: boolean;
    constructor(private router: Router) { }

    ngOnInit(): void { }

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

    getRoles() {
        let userId;
        if (this.isWithLeader) {
            userId = this.selectedMemberId;
        } else if (this.initiative.accountable) {
            userId = this.initiative.accountable.user_id;
        } else {
            return;
        }

        return this.initiative.getRoles(userId);
    }

    sortHelpers() {
        return sortBy(this.initiative.helpers, h => h.name)
    }
}