import { Component, Input } from '@angular/core';

import { User } from '@maptio-shared/model/user.data';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'maptio-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  standalone: true,
  imports: [NgClass, NgIf],
})
export class MemberComponent {
  @Input() member: User;
  @Input() isVertical = false;
}
