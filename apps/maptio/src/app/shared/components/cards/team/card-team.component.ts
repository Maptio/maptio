import { Component, OnInit, Input } from '@angular/core';
import { Team } from '../../../model/team.data';
import { User } from '../../../model/user.data';
import { sortBy } from 'lodash';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'common-card-team',
    templateUrl: './card-team.component.html',
    imports: [NgIf, RouterLink, NgFor, NgbTooltipModule]
})
export class CardTeamComponent implements OnInit {
  @Input('team') team: Team;
  constructor() {}

  trackByMemberId(index: number, member: User) {
    return member.user_id;
  }

  sortedMembers() {
    return sortBy(this.team.members, (m) => m.name).reverse();
  }

  ngOnInit(): void {}
}
