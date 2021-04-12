import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Helper } from '../shared/initiative.model';

@Component({
  selector: 'maptio-helper-avatar',
  templateUrl: './helper-avatar.component.html',
  styleUrls: ['./helper-avatar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HelperAvatarComponent implements OnInit {
  @Input() helper!: Helper;

  // tooltipText = '';

  roles: string[] = [];
  showRoles = false;

  ngOnInit(): void {
    // this.tooltipText = this.helper.name;
    this.helper.roles.forEach((role) => {
      if (role && role.title) {
        this.roles.push(role.title);
      }
    });

    this.showRoles = !!this.roles.length;
  }
}
