import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../../../../../../shared/model/user.data';

@Component({
    selector: 'initiative-member-label',
    templateUrl: './participant-label.component.html',
    // styleUrls: ['./participant-label.component.scss']
})
export class InitiativeParticipantLabelComponent implements OnInit {

    @Input("member") member: User;
    @Input("summaryUrl") summaryUrl?: string;

    constructor() { }

    ngOnInit(): void { }
}
