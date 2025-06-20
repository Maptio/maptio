import { Component, Input } from '@angular/core';

import { User } from '@maptio-shared/model/user.data';
import { NgClass } from '@angular/common';

@Component({
    selector: 'maptio-member',
    templateUrl: './member.component.html',
    styleUrls: ['./member.component.scss'],
    imports: [NgClass]
})
export class MemberComponent {
  @Input() member: User;
  @Input() isVertical = false;
}
