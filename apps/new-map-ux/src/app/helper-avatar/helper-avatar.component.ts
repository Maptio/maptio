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

  roles: string[] = [];
  showRoles = false;

  ngOnInit(): void {
    this.helper.roles.forEach((role) => {
      if (role && role.title) {
        this.roles.push(role.title);
      }
    });

    this.showRoles = !!this.roles.length;
  }

  onClick($event: MouseEvent) {
    // Avoid triggering click events for the circle when a helper avatar is clicked - especially important on mobile
    $event.stopPropagation();
  }
}
