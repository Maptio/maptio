import { Component, OnInit, Input } from '@angular/core';
import { Team } from '../../model/team.data';

@Component({
    selector: 'common-card-team',
    templateUrl: './card-team.component.html',
    // styleUrls: ['./card-team.component.css']
})
export class CardTeamComponent implements OnInit {

    @Input("team") team : Team;
    constructor() { }

    ngOnInit(): void { }
}
