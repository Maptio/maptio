import { Component, Input } from '@angular/core';

import { User } from '@maptio-shared/model/user.data';


@Component({
  selector: 'maptio-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
})
export class MemberComponent {
  @Input() member: User;
  @Input() isVertical = false;
}
