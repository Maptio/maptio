import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgIf, NgFor, LowerCasePipe } from '@angular/common';
import { Router } from '@angular/router';

import {
  NgbCollapseModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { sortBy } from 'lodash';

import { Initiative } from '@maptio-shared/model/initiative.data';
import { Team } from '@maptio-shared/model/team.data';
import { User } from '@maptio-shared/model/user.data';

import { InitiativeHelperRoleComponent } from '../../data-entry/details/parts/helpers/helper-role.component';

@Component({
  selector: 'personal-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    LowerCasePipe,

    NgbTooltipModule,
    NgbCollapseModule,

    InitiativeHelperRoleComponent,
  ],
})
export class PersonalCardComponent implements OnInit {
  @Input('initiative') initiative: Initiative;
  @Input('team') team: Team;
  @Input('datasetId') public datasetId: string;
  @Input('isWithLeader') isWithLeader: boolean;
  @Input('selectedMemberId') selectedMemberId: string;
  @Output('selectMember')
  selectMember: EventEmitter<User> = new EventEmitter<User>();
  @Output('selectInitiative')
  selectInitiative: EventEmitter<Initiative> = new EventEmitter<Initiative>();

  isShowRoles: boolean;
  constructor(private router: Router) {}

  ngOnInit(): void {}

  openInitiative(node: Initiative) {
    this.selectInitiative.emit(node);
  }

  onSelectMember(user: User) {
    this.selectMember.emit(user);
  }

  getWithDescriptionId() {
    return `with-description-${this.initiative.id}`;
  }
  getNoDescriptionId() {
    return `no-description-${this.initiative.id}`;
  }
  getMultipleCollapseId() {
    return `with-description-${this.initiative.id} no-description-${this.initiative.id}`;
  }
  getMultipleCollapseClass() {
    return `multi-collapse-${this.initiative.id}`;
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
    return sortBy(this.initiative.helpers, (h) => h.name);
  }
}
