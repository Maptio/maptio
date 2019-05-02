import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../../../../../shared/model/user.data';

@Component({
    selector: 'initiative-member-label',
    templateUrl: './participant-label.component.html',
    // styleUrls: ['./participant-label.component.scss']
})
export class InitiativeParticipantLabelComponent implements OnInit {

    @Input("member") member: User;
    @Input("isLabel") isLabel?: boolean = false;
    @Output("selectMember") selectMember: EventEmitter<User> = new EventEmitter<User>();

    constructor() { }

    onSelect(member: User) {

        localStorage.setItem("user_id", member.shortid)
        this.selectMember.emit(member);
    }

    ngOnInit(): void { }
}
