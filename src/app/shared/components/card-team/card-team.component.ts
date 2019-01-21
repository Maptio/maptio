import { Component, OnInit, Input } from '@angular/core';
import { Team } from '../../model/team.data';
import { User } from '../../model/user.data';
import { sortBy } from 'lodash';

@Component({
    selector: 'common-card-team',
    templateUrl: './card-team.component.html',
    // styleUrls: ['./card-team.component.css']
})
export class CardTeamComponent implements OnInit {

    @Input("team") team : Team;
    constructor() { }

    trackByMemberId(index: number, member: User) {
        return member.user_id;
    }

    sortedMembers(){
        return sortBy(this.team.members, m => m.name).reverse();
    }


    ngOnInit(): void { }
}
